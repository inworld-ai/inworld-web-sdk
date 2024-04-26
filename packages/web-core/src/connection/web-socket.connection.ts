import { v4 } from 'uuid';

import { version } from '../../package.json';
import { ClientRequest } from '../../proto/ai/inworld/engine/world-engine.pb';
import {
  Continuation,
  ContinuationContinuationType,
  InworldPacket as ProtoPacket,
  LoadedScene,
  SessionControlResponseEvent,
} from '../../proto/ai/inworld/packets/packets.pb';
import { CLIENT_ID } from '../common/constants';
import {
  Awaitable,
  Extension,
  InternalClientConfiguration,
  User,
} from '../common/data_structures';
import { HistoryItem } from '../components/history';
import { SessionContinuation } from '../entities/continuation/session_continuation.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { SessionToken } from '../entities/session_token.entity';
import { EventFactory } from '../factories/event';

const INWORLD_USER_ID = 'inworldUserId';
const SESSION_PATH = '/v1/session/open';

interface SessionProps<InworldPacketT, HistoryItemT> {
  name: string;
  client?: ClientRequest;
  user?: User;
  session: SessionToken;
  sessionContinuation?: SessionContinuation;
  extension?: Extension<InworldPacketT, HistoryItemT>;
  convertPacketFromProto: (proto: ProtoPacket) => InworldPacketT;
}

interface ConnectionProps {
  config?: InternalClientConfiguration;
  onDisconnect: () => Awaitable<void>;
  onReady: () => Awaitable<void>;
  onError: (err: Event | Error) => Awaitable<void>;
  onMessage: (packet: ProtoPacket) => Awaitable<void>;
}

export interface QueueItem<InworldPacketT> {
  getPacket: () => ProtoPacket;
  afterWriting?: (packet: InworldPacketT) => void;
  beforeWriting?: (packet: InworldPacketT) => Promise<void>;
}

export interface Connection<InworldPacketT, HistoryItemT> {
  close(): void;
  isActive: () => boolean;
  openSession(
    props: SessionProps<InworldPacketT, HistoryItemT>,
  ): Promise<SessionControlResponseEvent>;
  reopenSession(session: SessionToken): Promise<void>;
  write(item: QueueItem<InworldPacketT>): void;
}

export class WebSocketConnection<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> implements Connection<InworldPacketT, HistoryItemT>
{
  private connectionProps: ConnectionProps;
  private ws: WebSocket;
  private convertPacketFromProto: (proto: ProtoPacket) => InworldPacketT;

  constructor(props: ConnectionProps) {
    this.connectionProps = props;
  }

  isActive() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async openSession(
    props: SessionProps<InworldPacketT, HistoryItemT>,
  ): Promise<SessionControlResponseEvent> {
    this.convertPacketFromProto = props.convertPacketFromProto;
    const ws = await this.combineWebSocket(props.session);

    const finalPackets = this.getPackets(props);
    const needHistory =
      this.connectionProps.config.history?.previousState &&
      !!finalPackets.find((p) => p.sessionControl?.continuation);
    const write = this.write.bind({
      ws,
      convertPacketFromProto: props.convertPacketFromProto,
    });

    ws.addEventListener('open', () => {
      for (const packet of finalPackets) {
        write({ getPacket: () => packet });
      }

      this.connectionProps.onReady();
    });

    this.ws = ws;

    return new Promise((resolve, reject) =>
      ws.addEventListener(
        'message',
        this.onLoadScene({
          needHistory,
          ws,
          write,
          resolve,
          reject,
        }),
      ),
    );
  }

  async reopenSession(session: SessionToken) {
    const ws = await this.combineWebSocket(session);

    ws.addEventListener('message', this.onMessage.bind(this));

    return new Promise<void>((resolve) => {
      ws.addEventListener('open', () => {
        this.ws = ws;
        this.connectionProps.onReady();
        resolve();
      });
    });
  }

  close() {
    this.ws?.removeEventListener('error', this.connectionProps.onError);
    this.ws?.removeEventListener('close', this.connectionProps.onDisconnect);
    this.ws?.removeEventListener('message', this.onMessage);

    if (this.isActive()) {
      this.ws.close();
      this.connectionProps.onDisconnect();
    }

    this.ws = null;
  }

  async write(item: QueueItem<InworldPacketT>) {
    const packet = item.getPacket();
    const inworldPacket = this.convertPacketFromProto(packet);
    await item.beforeWriting?.(inworldPacket);
    this.ws.send(JSON.stringify(packet));
    item.afterWriting?.(inworldPacket);
  }

  private async combineWebSocket(session: SessionToken) {
    const { onDisconnect, onError } = this.connectionProps;
    const { hostname, ssl } = this.connectionProps.config.connection.gateway;

    const url = `${
      ssl ? 'wss' : 'ws'
    }://${hostname}${SESSION_PATH}?session_id=${session.sessionId}`;

    const ws = new WebSocket(url, [session.type, session.token]);

    if (onDisconnect) {
      ws.addEventListener('close', onDisconnect);
    }

    if (onError) {
      ws.addEventListener('error', onError);
    }

    return ws;
  }

  private parseEvent(event: MessageEvent) {
    let payload;

    try {
      payload = JSON.parse(event.data);
    } catch {}

    if (!payload) {
      return [new Error('Invalid JSON received as WS event data')];
    } else if (payload.error) {
      return [payload.error];
    }

    if (payload.result) {
      return [null, payload.result as ProtoPacket];
    }
  }

  private onLoadScene({
    needHistory,
    write,
    ws,
    resolve,
    reject,
  }: {
    needHistory: boolean;
    ws: WebSocket;
    write: (item: QueueItem<InworldPacketT>) => void;
    resolve: (value: SessionControlResponseEvent) => void;
    reject: (reason: Error) => void;
  }) {
    const { parseEvent } = this;
    const onMessage = this.onMessage.bind(this);

    let historyLoaded = true;
    let loadedScene: LoadedScene;

    return function (event: MessageEvent) {
      const [err, packet] = parseEvent(event);

      if (err) {
        reject(err);
      } else if (
        (!loadedScene && packet?.sessionControlResponse) ||
        (!historyLoaded && packet?.sessionControlResponse?.sessionHistory)
      ) {
        loadedScene = loadedScene ?? packet?.sessionControlResponse.loadedScene;
        historyLoaded =
          !!packet?.sessionControlResponse?.sessionHistory || !needHistory;

        if (!!loadedScene && !historyLoaded && needHistory) {
          write({
            getPacket: () =>
              EventFactory.sessionControl({ sessionHistory: {} }),
          });
        } else {
          ws.removeEventListener('message', this);
          ws.addEventListener('message', onMessage);

          resolve({
            loadedScene,
            sessionHistory: packet?.sessionControlResponse?.sessionHistory,
          } as SessionControlResponseEvent);
        }
      }
    };
  }

  private onMessage(event: MessageEvent) {
    const [err, packet] = this.parseEvent(event);

    if (err) {
      this.connectionProps.onError(err);
    } else if (packet) {
      this.connectionProps.onMessage(packet);
    }
  }

  private getPackets(props: SessionProps<InworldPacketT, HistoryItemT>) {
    const { config } = this.connectionProps;

    const packets: ProtoPacket[] = [
      EventFactory.sessionControl({
        capabilities: config.capabilities,
      }),
    ];

    if (config.gameSessionId) {
      packets.push(
        EventFactory.sessionControl({
          sessionConfiguration: {
            gameSessionId: config.gameSessionId,
          },
        }),
      );
    }

    packets.push(
      EventFactory.sessionControl({
        clientConfiguration: this.getClient(props),
      }),
      EventFactory.sessionControl({
        userConfiguration: this.getUserConfiguration(props),
      }),
    );

    const continuation = this.getContinuation(props);

    if (continuation) {
      packets.push(EventFactory.sessionControl({ continuation }));
    }

    packets.push(EventFactory.loadScene(props.name));

    return props.extension?.beforeLoadScene?.(packets) || packets;
  }

  private getClient(props: SessionProps<InworldPacketT, HistoryItemT>) {
    const description = [CLIENT_ID, version, navigator.userAgent];

    if (props.client?.id) {
      description.push(props.client.id);
    }

    return {
      id: CLIENT_ID,
      version,
      description: description.join('; '),
    } as ClientRequest;
  }

  private getUserConfiguration(
    props: SessionProps<InworldPacketT, HistoryItemT>,
  ) {
    const { id, fullName, profile } = props.user || {};

    return {
      id: id ? id : this.getUserId(),
      ...(fullName && { name: fullName }),
      ...(profile?.fields.length && {
        userSettings: {
          playerProfile: {
            fields: profile.fields.map(
              ({ id: fieldId, value: fieldValue }) => ({ fieldId, fieldValue }),
            ),
          },
        },
      }),
    };
  }

  private getUserId() {
    let id = localStorage.getItem(INWORLD_USER_ID);

    if (!id) {
      id = v4();
      localStorage.setItem(INWORLD_USER_ID, id);
    }

    return id;
  }

  private getContinuation(props: SessionProps<InworldPacketT, HistoryItemT>) {
    const { sessionContinuation } = props;

    const continuation = {
      ...(sessionContinuation?.previousState && {
        continuationType:
          ContinuationContinuationType.CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE,
        externallySavedState:
          sessionContinuation.previousState as unknown as Uint8Array,
      }),
      ...(sessionContinuation?.previousDialog && {
        continuationType:
          ContinuationContinuationType.CONTINUATION_TYPE_DIALOG_HISTORY,
        dialogHistory: sessionContinuation.previousDialog.toProto(),
      }),
    } as Continuation;

    return continuation.continuationType ? continuation : undefined;
  }
}
