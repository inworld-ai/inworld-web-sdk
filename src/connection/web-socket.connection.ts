import { InworldPacket as ProtoPacket } from '../../proto/packets.pb';
import {
  Awaitable,
  InternalClientConfiguration,
  SessionToken,
  VoidFn,
} from '../common/data_structures';

const SESSION_PATH = '/v1/session/default';

interface SessionProps {
  config: InternalClientConfiguration;
  session: SessionToken;
  onDisconnect?: VoidFn;
  onError?: (err: Event | Error) => void;
  onMessage?: (packet: ProtoPacket) => Awaitable<void>;
  onReady?: VoidFn;
}
interface ConnectionProps {
  config?: InternalClientConfiguration;
  onDisconnect?: VoidFn;
  onReady?: () => Awaitable<void>;
  onError?: (err: Event | Error) => void;
  onMessage?: (packet: ProtoPacket) => Awaitable<void>;
}

interface OpenConnectionProps {
  characters?: string[];
  session: SessionToken;
}

export interface QueueItem {
  getPacket: () => ProtoPacket;
  afterWriting?: (packet: ProtoPacket) => void;
}

export interface Connection {
  close(): void;
  isActive: () => boolean;
  open(props: OpenConnectionProps): Promise<void>;
  write(item: QueueItem): void;
}

export class WebSocketConnection implements Connection {
  private connectionProps: ConnectionProps;
  private ws: WebSocket;
  private packetQueue: QueueItem[] = [];

  constructor(props: ConnectionProps) {
    this.connectionProps = props;
  }

  isActive() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async open({ session }: OpenConnectionProps) {
    const { config, onError, onDisconnect, onMessage, onReady } =
      this.connectionProps;

    this.ws = this.createWebSocket({
      config,
      session,
      onError,
      onDisconnect,
      ...(onReady && { onReady }),
      ...(onMessage && { onMessage }),
    });
  }

  close() {
    if (this.connectionProps.onReady) {
      this.ws?.removeEventListener('open', this.onReady);
    }

    if (this.connectionProps.onError) {
      this.ws?.removeEventListener('error', this.connectionProps.onError);
    }

    if (this.connectionProps.onDisconnect) {
      this.ws?.removeEventListener('close', this.connectionProps.onDisconnect);
    }

    this.ws?.removeEventListener('message', this.onMessage);

    if (this.isActive()) {
      this.ws?.close();
      this.connectionProps.onDisconnect?.();
    }

    this.ws = null;
    this.packetQueue = [];
  }

  write(item: QueueItem) {
    // There's time gap between connection creation and connection activation.
    // So put packets to queue and send them `onReady` event.
    if (this.isActive()) {
      const packet = item.getPacket();
      this.ws?.send(JSON.stringify(packet));
      item.afterWriting?.(packet);
    } else {
      this.packetQueue.push(item);
    }
  }

  private createWebSocket(props: SessionProps) {
    const { config, session, onDisconnect, onError } = props;
    const { hostname, ssl } = config.connection.gateway;

    const url = `${
      ssl ? 'wss' : 'ws'
    }://${hostname}${SESSION_PATH}?session_id=${session.sessionId}`;

    const ws = new WebSocket(url, [session.type, session.token]);

    ws.addEventListener('open', this.onReady.bind(this));

    ws.addEventListener('message', this.onMessage.bind(this));

    if (onDisconnect) {
      ws.addEventListener('close', onDisconnect);
    }

    if (onError) {
      ws.addEventListener('error', onError);
    }

    return ws;
  }

  private onMessage(event: MessageEvent) {
    const { onError, onMessage } = this.connectionProps;

    const payload = JSON.parse(event.data);

    if (payload.error && onError) {
      onError(payload.error);
    }

    if (!payload.error && onMessage) {
      onMessage(payload.result as ProtoPacket);
    }
  }

  private onReady() {
    setTimeout(() => {
      this.packetQueue.forEach((item) => this.write(item));
      this.packetQueue = [];

      this.connectionProps.onReady?.();
    }, 0);
  }
}
