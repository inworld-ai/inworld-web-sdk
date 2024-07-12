import { v4 } from 'uuid';

import { version } from '../../package.json';
import { CapabilitiesConfiguration } from '../../proto/ai/inworld/engine/configuration/configuration.pb';
import { ClientRequest } from '../../proto/ai/inworld/engine/world-engine.pb';
import {
  Continuation,
  ContinuationContinuationType,
  ControlEventAction,
  CurrentSceneStatus,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import { CLIENT_ID } from '../common/constants';
import {
  Awaitable,
  Extension,
  InternalClientConfiguration,
  LoadedScene,
  ProtoError,
  User,
} from '../common/data_structures';
import { HistoryItem } from '../components/history';
import { SessionContinuation } from '../entities/continuation/session_continuation.entity';
import { InworldError } from '../entities/error.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { SessionToken } from '../entities/session_token.entity';
import { EventFactory } from '../factories/event';

const INWORLD_USER_ID = 'inworldUserId';
const SESSION_PATH = '/v1/session/open';

interface OpenSessionProps {
  name: string;
  client?: ClientRequest;
  user?: User;
  session: SessionToken;
  sessionContinuation?: SessionContinuation;
}

interface UpdateSessionProps {
  name: string;
  gameSessionId?: string;
  capabilities?: CapabilitiesConfiguration;
  sessionContinuation?: SessionContinuation;
}

interface ConnectionProps<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> {
  config?: InternalClientConfiguration;
  onDisconnect: () => Awaitable<void>;
  onReady: () => Awaitable<void>;
  onError: (err: InworldError) => Awaitable<void>;
  onMessage: (packet: ProtoPacket) => Awaitable<void>;
  extension: Extension<InworldPacketT, HistoryItemT>;
}

export interface QueueItem<InworldPacketT> {
  getPacket: () => ProtoPacket;
  afterWriting?: (packet: InworldPacketT) => void;
  beforeWriting?: (packet: InworldPacketT) => Promise<void>;
}

export interface Connection<InworldPacketT> {
  close(): Promise<void>;
  isActive: () => boolean;
  openSession(props: OpenSessionProps): Promise<LoadedScene>;
  reopenSession(session: SessionToken): Promise<void>;
  updateSession(props: UpdateSessionProps): Promise<LoadedScene>;
  write(item: QueueItem<InworldPacketT>): void;
}

export class WebSocketConnection<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> implements Connection<InworldPacketT>
{
  private connectionProps: ConnectionProps<InworldPacketT, HistoryItemT>;
  private ws: WebSocket;
  private extension: Extension<InworldPacketT, HistoryItemT>;
  private onMessage: (event: MessageEvent) => void;
  private onError: (err: Event | InworldError) => void;

  constructor(props: ConnectionProps<InworldPacketT, HistoryItemT>) {
    this.connectionProps = props;
    this.onMessage = (event: MessageEvent) => {
      const [err, packet] = this.parseEvent(event);

      if (err) {
        this.onError(err);
      } else if (packet) {
        this.connectionProps.onMessage(packet);
      }
    };
    this.onError = (err: Event | InworldError) => {
      if (err instanceof InworldError) {
        this.connectionProps.onError(err);
      } else {
        this.connectionProps.onError(new InworldError(err.toString()));
      }
    };
    this.extension = props.extension;
  }

  isActive() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async openSession(props: OpenSessionProps): Promise<LoadedScene> {
    const ws = await this.combineWebSocket(props.session);

    const finalPackets = this.getPackets({
      capabilities: this.connectionProps.config.capabilities,
      client: props.client,
      gameSessionId: this.connectionProps.config.gameSessionId,
      name: props.name,
      sessionContinuation: props.sessionContinuation,
      user: props.user,
      useDefaultClient: !props.client,
    });

    const needHistory =
      this.connectionProps.config.history?.previousState &&
      !!finalPackets.find((p) => p.control?.sessionConfiguration?.continuation);
    const write = this.write.bind({
      ws,
      extension: this.extension,
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

    ws.addEventListener('message', this.onMessage);

    return new Promise<void>((resolve) => {
      ws.addEventListener('open', () => {
        this.ws = ws;
        this.connectionProps.onReady();
        resolve();
      });
    });
  }

  async updateSession(props: UpdateSessionProps): Promise<LoadedScene> {
    this.ws.removeEventListener('message', this.onMessage);
    const finalPackets = this.getPackets({
      capabilities: props.capabilities,
      gameSessionId: props.gameSessionId,
      name: props.name,
      sessionContinuation: props.sessionContinuation,
    });
    const write = this.write.bind({
      ws: this.ws,
      extension: this.extension,
    });
    const needHistory =
      this.connectionProps.config.history?.previousState &&
      !!finalPackets.find((p) => p.sessionControl?.continuation);

    for (const packet of finalPackets) {
      write({
        getPacket: () => packet,
        afterWriting: () => this.connectionProps.onMessage(packet),
      });
    }

    return new Promise((resolve, reject) =>
      this.ws.addEventListener(
        'message',
        this.onLoadScene({
          firstLoad: false,
          needHistory,
          ws: this.ws,
          write,
          resolve,
          reject,
        }),
      ),
    );
  }

  async close(): Promise<void> {
    if (this.isActive()) {
      this.ws.close();
      this.connectionProps.onDisconnect();
    }

    this.ws?.removeEventListener('error', this.onError);
    this.ws?.removeEventListener('close', this.connectionProps.onDisconnect);
    this.ws?.removeEventListener('message', this.onMessage);

    await new Promise<void>((resolve) => {
      if (this.ws?.readyState !== WebSocket.CLOSING) {
        return resolve();
      }

      const interval = setInterval(() => {
        if (this.ws.readyState === WebSocket.CLOSED) {
          clearInterval(interval);
          resolve();
        }
      });
    });

    this.ws = undefined;
  }

  async write(item: QueueItem<InworldPacketT>) {
    const packet = item.getPacket();
    const inworldPacket = this.extension.convertPacketFromProto(packet);
    await item.beforeWriting?.(inworldPacket);
    this.ws.send(JSON.stringify(packet));
    item.afterWriting?.(inworldPacket);
  }

  private async combineWebSocket(session: SessionToken) {
    const { onDisconnect } = this.connectionProps;
    const { hostname, ssl } = this.connectionProps.config.connection.gateway;

    const url = `${
      ssl ? 'wss' : 'ws'
    }://${hostname}${SESSION_PATH}?session_id=${session.sessionId}`;

    const ws = new WebSocket(url, [session.type, session.token]);

    if (onDisconnect) {
      ws.addEventListener('close', onDisconnect);
    }

    ws.addEventListener('error', this.onError);

    return ws;
  }

  private parseEvent(
    event: MessageEvent,
  ): [InworldError, ProtoPacket] | [undefined, ProtoPacket] | [InworldError] {
    let payload;

    try {
      payload = JSON.parse(event.data);
    } catch {}

    if (!payload) {
      return [new InworldError('Invalid JSON received as WS event data')];
    } else if (payload.error) {
      return [InworldError.fromProto(payload.error as ProtoError)];
    }

    if (payload.result) {
      return [undefined, payload.result as ProtoPacket];
    }
  }

  private onLoadScene({
    firstLoad = true,
    needHistory,
    write,
    ws,
    resolve,
    reject,
  }: {
    firstLoad?: boolean;
    needHistory: boolean;
    ws: WebSocket;
    write: (item: QueueItem<InworldPacketT>) => void;
    resolve: (value: LoadedScene) => void;
    reject: (reason: InworldError) => void;
  }) {
    const { parseEvent, onMessage } = this;
    let historyLoaded = true;
    let sceneStatus: CurrentSceneStatus;

    return function (event: MessageEvent) {
      const [err, packet] = parseEvent(event);

      if (err) {
        reject(err);
      } else if (
        (!sceneStatus &&
          packet?.control?.action ===
            ControlEventAction.CURRENT_SCENE_STATUS) ||
        (!historyLoaded && packet?.sessionControlResponse?.sessionHistory)
      ) {
        if (!firstLoad && !sceneStatus && packet?.control.currentSceneStatus) {
          onMessage(event);
        }

        const sessionHistory = packet?.sessionControlResponse?.sessionHistory;

        sceneStatus = sceneStatus ?? packet?.control.currentSceneStatus;
        historyLoaded = !!sessionHistory || !needHistory;

        if (!!sceneStatus && !historyLoaded && needHistory) {
          write({
            getPacket: () =>
              EventFactory.sessionControl({ sessionHistory: {} }),
          });
        } else {
          ws.removeEventListener('message', this);
          ws.addEventListener('message', onMessage);

          resolve({
            sceneStatus,
            sessionHistory,
          } as LoadedScene);
        }
      }
    };
  }

  private getPackets(props: {
    name: string;
    capabilities?: CapabilitiesConfiguration;
    client?: ClientRequest;
    user?: User;
    sessionContinuation?: SessionContinuation;
    gameSessionId?: string;
    useDefaultClient?: boolean;
  }) {
    const continuation = this.getContinuation({
      sessionContinuation: props.sessionContinuation,
    });

    const packets: ProtoPacket[] = [
      EventFactory.sessionControl({
        ...(props.capabilities && {
          capabilities: props.capabilities,
        }),
        ...(props.gameSessionId && {
          sessionConfiguration: { gameSessionId: props.gameSessionId },
        }),
        ...((props.client || props.useDefaultClient) && {
          clientConfiguration: this.getClient({
            client: props.client,
          }),
        }),
        ...(props.user && {
          userConfiguration: this.getUserConfiguration(props),
        }),
        ...(continuation && { continuation }),
      }),
      EventFactory.loadScene(props.name),
    ];

    return this.extension.beforeLoadScene?.(packets) || packets;
  }

  private getClient(props: { client?: ClientRequest }) {
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

  private getUserConfiguration(props: { user?: User }) {
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

  private getContinuation(props: {
    sessionContinuation?: SessionContinuation;
  }) {
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
