import { ClientRequest } from '../../proto/ai/inworld/engine/world-engine.pb';
import { InworldPacket as ProtoPacket } from '../../proto/ai/inworld/packets/packets.pb';
import {
  AudioSessionState,
  Awaitable,
  CancelResponses,
  CancelResponsesProps,
  ConnectionState,
  Extension,
  GenerateSessionTokenFn,
  InternalClientConfiguration,
  SendPacketParams,
  TtsPlaybackAction,
  User,
} from '../common/data_structures';
import {
  CHAT_HISTORY_TYPE,
  HistoryItem,
  InworldHistory,
} from '../components/history';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import { Player } from '../components/sound/player';
import {
  Connection,
  QueueItem,
  WebSocketConnection,
} from '../connection/web-socket.connection';
import { Character } from '../entities/character.entity';
import { SessionContinuation } from '../entities/continuation/session_continuation.entity';
import { InworldPacket } from '../entities/inworld_packet.entity';
import { Scene } from '../entities/scene.entity';
import { SessionToken } from '../entities/session_token.entity';
import { EventFactory } from '../factories/event';
import { StateSerializationService } from './pb/state_serialization.service';

interface ConnectionProps<InworldPacketT, HistoryItemT> {
  name?: string;
  user?: User;
  client?: ClientRequest;
  config?: InternalClientConfiguration;
  sessionContinuation?: SessionContinuation;
  onReady?: () => Awaitable<void>;
  onError?: (err: Event | Error) => Awaitable<void>;
  onMessage?: (packet: InworldPacketT) => Awaitable<void>;
  onDisconnect?: () => Awaitable<void>;
  onInterruption?: (props: CancelResponsesProps) => Awaitable<void>;
  onHistoryChange?: (
    history: HistoryItem[],
    diff: HistoryItem[],
  ) => Awaitable<void>;
  grpcAudioPlayer: GrpcAudioPlayback;
  webRtcLoopbackBiDiSession: GrpcWebRtcLoopbackBiDiSession;
  generateSessionToken: GenerateSessionTokenFn;
  extension?: Extension<InworldPacketT, HistoryItemT>;
}

export class ConnectionService<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> {
  private player = Player.getInstance();
  private state: ConnectionState = ConnectionState.INACTIVE;
  private audioSessionAction = AudioSessionState.UNKNOWN;
  private audioSessionParams: SendPacketParams = {};
  private ttsPlaybackAction = TtsPlaybackAction.UNKNOWN;

  private scene: Scene | undefined;
  private session: SessionToken;
  private connection: Connection<InworldPacketT, HistoryItemT>;
  private connectionProps: ConnectionProps<InworldPacketT, HistoryItemT>;

  private eventFactory = new EventFactory();
  private intervals: NodeJS.Timeout[] = [];
  private packetQueue: QueueItem<InworldPacketT>[] = [];

  private disconnectTimeoutId: NodeJS.Timeout;

  private stateService = new StateSerializationService();

  private onDisconnect: (() => Awaitable<void>) | undefined;
  private onError: (err: Event | Error) => Awaitable<void>;
  private onMessage: ((packet: ProtoPacket) => Awaitable<void>) | undefined;
  private onReady: (() => Awaitable<void>) | undefined;

  private cancelResponses: CancelResponses = {};
  private history: InworldHistory;
  private extension: Extension<InworldPacketT, HistoryItemT>;

  constructor(props?: ConnectionProps<InworldPacketT, HistoryItemT>) {
    this.connectionProps =
      props || ({} as ConnectionProps<InworldPacketT, HistoryItemT>);
    this.history = new InworldHistory<InworldPacketT>({
      extension: this.connectionProps.extension,
      user: this.connectionProps.user,
    });

    this.initializeHandlers();
    this.initializeConnection();
    this.initializeExtension();
  }

  isActive() {
    return this.state === ConnectionState.ACTIVE;
  }

  isAutoReconnected() {
    return this.connectionProps.config?.connection?.autoReconnect ?? true;
  }

  async getSessionState() {
    try {
      const { config, name: scene } = this.connectionProps;
      const session = await this.ensureSessionToken();

      return this.stateService.getSessionState({
        config,
        scene,
        session,
      });
    } catch (err) {
      this.onError(err);
    }
  }

  async openManually() {
    try {
      if (this.isAutoReconnected()) {
        throw Error(
          'Impossible to open connection manually with `autoReconnect` enabled',
        );
      }

      if (this.state !== ConnectionState.INACTIVE) {
        throw Error('Connection is already open');
      }

      return this.open();
    } catch (err) {
      this.onError(err);
    }
  }

  close() {
    this.cancelScheduler();
    this.state = ConnectionState.INACTIVE;
    this.connection.close();
    this.clearQueue();
  }

  getHistory() {
    return this.history.get();
  }

  clearHistory() {
    this.history.clear();
  }

  getEventFactory() {
    return this.eventFactory;
  }

  getTranscript() {
    return this.history.getTranscript();
  }

  async getCharacters() {
    await this.open();

    return this.scene.characters;
  }

  async open() {
    if (this.state !== ConnectionState.INACTIVE) return;

    try {
      await this.loadToken();

      const { client, name, sessionContinuation, user } = this.connectionProps;

      const packets = this.getPacketsToSentOnOpen();

      this.packetQueue = [...packets, ...this.packetQueue];
      this.scene = await this.connection.openSession({
        client,
        name,
        sessionContinuation,
        user,
        session: this.session,
        convertPacketFromProto: this.extension.convertPacketFromProto,
      });

      const factory = this.getEventFactory();

      if (
        !this.connectionProps.config.capabilities.multiAgent &&
        !factory.getCurrentCharacter() &&
        this.scene.characters[0]
      ) {
        factory.setCurrentCharacter(this.scene.characters[0]);
      }

      factory.setCharacters(this.scene.characters);

      if (this.scene?.history?.length) {
        this.setPreviousState(this.scene.history);
      }

      await this.onReady?.();
      this.releaseQueue();
      this.scheduleDisconnect();
    } catch (err) {
      this.onError(err);
    }
  }

  async send(getPacket: () => ProtoPacket) {
    try {
      this.cancelScheduler();

      if (!this.isActive() && !this.isAutoReconnected()) {
        throw Error('Unable to send data due inactive connection');
      }

      return this.write(getPacket);
    } catch (err) {
      this.onError(err);
    }
  }

  setAudioSessionAction(action: AudioSessionState) {
    this.audioSessionAction = action;
  }

  setAudioSessionParams(params: SendPacketParams = {}) {
    this.audioSessionParams = params;
  }

  getAudioSessionAction() {
    return this.audioSessionAction;
  }

  getAudioSessionParams() {
    return this.audioSessionParams;
  }

  setTtsPlaybackAction(action: TtsPlaybackAction) {
    this.ttsPlaybackAction = action;
  }

  getTtsPlaybackAction() {
    return this.ttsPlaybackAction;
  }

  async interrupt() {
    const packet =
      this.connectionProps.grpcAudioPlayer.getCurrentPacket() as InworldPacketT;

    if (packet) {
      await this.interruptByPacket(packet);
    }
  }

  private async write(getPacket: () => ProtoPacket) {
    let inworldPacket: InworldPacketT;

    const resolvePacket = () =>
      new Promise<InworldPacketT>((resolve) => {
        const interval = setInterval(() => {
          if (inworldPacket || this.state === ConnectionState.INACTIVE) {
            clearInterval(interval);

            this.intervals = this.intervals.filter(
              (i: NodeJS.Timeout) => i !== interval,
            );

            resolve(inworldPacket);
          }
        }, 10);
        this.intervals.push(interval);
      });

    const itemToSend = {
      getPacket,
      afterWriting: (packet: InworldPacketT) => {
        inworldPacket = packet;

        this.scheduleDisconnect();

        this.addPacketToHistory(inworldPacket);
      },
      beforeWriting: async (packet: InworldPacketT) => {
        if (packet.isText()) {
          await this.interruptByPacket(packet);
        }
      },
    };

    if (this.isActive()) {
      this.connection.write(itemToSend);
    } else {
      this.packetQueue.push(itemToSend);

      await this.open();
    }

    return resolvePacket();
  }

  private async loadToken() {
    if (this.state === ConnectionState.ACTIVATING) return;

    await this.ensureSessionToken({
      beforeLoading: () => {
        this.state = ConnectionState.ACTIVATING;
      },
    });
  }

  async ensureSessionToken(props?: { beforeLoading: () => void }) {
    // Generate new session token is it's empty or expired
    if (!this.session || SessionToken.isExpired(this.session)) {
      const { sessionId } = this.session || {};

      props?.beforeLoading?.();
      let sessionToken = await this.connectionProps.generateSessionToken();

      // Reuse session id to keep context of previous conversation
      if (sessionId) {
        sessionToken = {
          ...this.session,
          sessionId,
        };
      }

      this.session = sessionToken;
    }

    return this.session;
  }

  private scheduleDisconnect() {
    if (this.connectionProps.config?.connection?.disconnectTimeout) {
      this.cancelScheduler();
      this.disconnectTimeoutId = setTimeout(
        () => this.close(),
        this.connectionProps.config.connection.disconnectTimeout,
      );
    }
  }

  private setPreviousState(previousPackets: ProtoPacket[]) {
    previousPackets.forEach((packet) =>
      this.history.addOrUpdate({
        grpcAudioPlayer: this.connectionProps.grpcAudioPlayer,
        characters: this.eventFactory.getCharacters(),
        packet: this.extension.convertPacketFromProto(packet),
      }),
    );

    const changed = this.history.get();

    if (changed.length) {
      this.connectionProps.onHistoryChange?.(changed, changed);
    }
  }

  private cancelScheduler() {
    if (this.disconnectTimeoutId) {
      clearTimeout(this.disconnectTimeoutId);
    }
  }

  private releaseQueue() {
    this.packetQueue.forEach((item: QueueItem<InworldPacketT>) =>
      this.connection.write(item),
    );

    this.packetQueue = [];
  }

  private clearQueue() {
    this.intervals.forEach((i: NodeJS.Timeout) => {
      clearInterval(i);
    });

    this.intervals = [];
    this.packetQueue = [];
  }

  private initializeHandlers() {
    const {
      onError,
      onReady,
      onDisconnect,
      grpcAudioPlayer,
      webRtcLoopbackBiDiSession,
    } = this.connectionProps;

    this.onReady = async () => {
      await webRtcLoopbackBiDiSession.startSession(
        new MediaStream(),
        grpcAudioPlayer.getPlaybackStream(),
      );
      this.player.setStream(
        webRtcLoopbackBiDiSession.getPlaybackLoopbackStream(),
      );
      this.state = ConnectionState.ACTIVE;
      await onReady?.();
    };

    this.onDisconnect = async () => {
      this.state = ConnectionState.INACTIVE;
      this.audioSessionAction = AudioSessionState.UNKNOWN;
      await onDisconnect?.();
    };

    this.onError = onError ?? ((event: Event | Error) => console.error(event));

    this.onMessage = async (packet: ProtoPacket) => {
      const { onMessage, grpcAudioPlayer } = this.connectionProps;

      const inworldPacket = this.extension.convertPacketFromProto(packet);
      const interactionId = inworldPacket.packetId.interactionId;

      // Don't pass text packet outside for interrupred interaction.
      if (
        inworldPacket.isText() &&
        !inworldPacket.routing.source.isPlayer &&
        this.cancelResponses[interactionId]
      ) {
        this.sendCancelResponses(
          {
            interactionId,
            utteranceId: [packet.packetId.utteranceId],
          },
          [
            {
              id: packet.routing.source.name,
            } as Character,
          ],
        );

        return;
      }

      // Send cancel response event in case of player talking.
      if (inworldPacket.isText() && inworldPacket.routing.source.isPlayer) {
        await this.interruptByPacket(inworldPacket);
      }

      // Play audio or silence.
      if (inworldPacket.isAudio() || inworldPacket.isSilence()) {
        if (!this.cancelResponses[interactionId]) {
          grpcAudioPlayer.addToQueue({
            packet: inworldPacket,
            onBeforePlaying: (packet: InworldPacketT) => {
              this.displayPlacketInHistory(packet, CHAT_HISTORY_TYPE.ACTOR);
              this.displayPlacketInHistory(
                packet,
                CHAT_HISTORY_TYPE.NARRATED_ACTION,
              );
            },
            onAfterPlaying: (packet: InworldPacketT) => {
              this.displayPlacketInHistory(
                packet,
                CHAT_HISTORY_TYPE.INTERACTION_END,
              );
            },
          });
        }
      }

      // Delete info about cancel responses on interaction end.
      if (inworldPacket.isInteractionEnd()) {
        delete this.cancelResponses[interactionId];
      }

      // Add packet to history.
      this.addPacketToHistory(inworldPacket);

      // Pass packet to external callback.
      onMessage?.(inworldPacket);
    };
  }

  private initializeConnection() {
    const { config } = this.connectionProps;

    const props = {
      config,
      onDisconnect: this.onDisconnect,
      onReady: this.onReady,
      onError: this.onError,
      onMessage: this.onMessage,
    };

    this.connection = new WebSocketConnection(props);
  }

  private initializeExtension() {
    const extension = this.connectionProps.extension ?? {};

    this.extension = {
      convertPacketFromProto: (proto: ProtoPacket) =>
        InworldPacket.fromProto(proto) as InworldPacketT,
      ...extension,
    };
  }

  private async interruptByPacket(packet: InworldPacketT) {
    const { grpcAudioPlayer, config } = this.connectionProps;

    if (!config?.capabilities.interruptions) return;

    const packets = await grpcAudioPlayer.stopForInteraction(
      packet.packetId.interactionId,
    );

    if (packets.length) {
      const interactionId = packets[0].packetId.interactionId;
      const characters = packets.map(
        (packet: InworldPacketT) =>
          ({
            id: packet.routing.source.name,
          } as Character),
      );

      this.sendCancelResponses(
        {
          interactionId,
          utteranceId: packets.map(
            (packet: InworldPacketT) => packet.packetId.utteranceId,
          ),
        },
        characters,
      );
    }
  }

  private sendCancelResponses(
    cancelResponses: CancelResponsesProps,
    characters?: Character[],
  ) {
    if (cancelResponses.interactionId) {
      this.send(() =>
        this.getEventFactory().cancelResponse(cancelResponses, characters),
      );

      this.cancelResponses = {
        ...this.cancelResponses,
        [cancelResponses.interactionId]: true,
      };

      const interruptionData = {
        utteranceId: cancelResponses.utteranceId ?? [],
        interactionId: cancelResponses.interactionId,
      };

      this.connectionProps.onInterruption?.(interruptionData);

      this.history.filter(interruptionData);
    }
  }

  private addPacketToHistory(packet: InworldPacketT) {
    const changed = this.history.addOrUpdate({
      grpcAudioPlayer: this.connectionProps.grpcAudioPlayer,
      characters: this.eventFactory.getCharacters(),
      packet,
    });

    if (changed.length) {
      this.connectionProps.onHistoryChange?.(this.getHistory(), changed);
    }
  }

  private displayPlacketInHistory(
    packet: InworldPacketT,
    type:
      | CHAT_HISTORY_TYPE.ACTOR
      | CHAT_HISTORY_TYPE.INTERACTION_END
      | CHAT_HISTORY_TYPE.NARRATED_ACTION,
  ) {
    const changed = this.history.display(packet, type);

    if (changed.length) {
      this.connectionProps.onHistoryChange?.(this.getHistory(), changed);
    }
  }

  private getPacketsToSentOnOpen() {
    const packets: QueueItem<InworldPacketT>[] = [];

    if (this.isAutoReconnected()) {
      if (this.getTtsPlaybackAction() === TtsPlaybackAction.MUTE) {
        packets.push({
          getPacket: () => this.getEventFactory().ttsPlaybackMute(true),
        });
      }
    }

    return packets;
  }
}
