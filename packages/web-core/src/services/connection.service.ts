import { ClientRequest } from '../../proto/ai/inworld/engine/world-engine.pb';
import {
  Actor,
  ActorType,
  ControlEventAction,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  AudioSessionState,
  Awaitable,
  CancelResponses,
  CancelResponsesProps,
  ChangeSceneProps,
  ConnectionState,
  ConversationMapItem,
  ConversationState,
  Extension,
  GenerateSessionTokenFn,
  HistoryChangedProps,
  InternalClientConfiguration,
  InworldConversationEventType,
  LoadedScene,
  SceneHistoryItem,
  User,
} from '../common/data_structures';
import { objectsAreEqual } from '../common/helpers';
import { HistoryItem, InworldHistory } from '../components/history';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import { Player } from '../components/sound/player';
import {
  Connection,
  QueueItem,
  WebSocketConnection,
} from '../connection/web-socket.connection';
import { Capability } from '../entities/capability.entity';
import { Character } from '../entities/character.entity';
import { SessionContinuation } from '../entities/continuation/session_continuation.entity';
import {
  ErrorReconnectionType,
  ErrorType,
  InworldError,
  InworldStatus,
} from '../entities/error.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { Scene } from '../entities/scene.entity';
import { SessionToken } from '../entities/session_token.entity';
import { EventFactory } from '../factories/event';
import { ConversationService } from './conversation.service';

interface ConnectionProps<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> {
  name: string;
  user?: User;
  client?: ClientRequest;
  config?: InternalClientConfiguration;
  sessionContinuation?: SessionContinuation;
  onReady?: () => Awaitable<void>;
  onError?: (err: InworldError) => Awaitable<void>;
  onMessage?: (packet: InworldPacketT) => Awaitable<void>;
  onWarning?: (packet: InworldPacketT) => Awaitable<void>;
  onDisconnect?: () => Awaitable<void>;
  onInterruption?: (props: CancelResponsesProps) => Awaitable<void>;
  onHistoryChange?: (
    history: HistoryItem[],
    props: HistoryChangedProps<HistoryItemT>,
  ) => Awaitable<void>;
  grpcAudioPlayer: GrpcAudioPlayback<InworldPacketT>;
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

  private scene: Scene | undefined;
  private characterMapping: Record<string, string> = {};
  private sceneIsLoaded = false;
  private session: SessionToken;
  private connection: Connection<InworldPacketT>;
  private connectionProps: ConnectionProps<InworldPacketT, HistoryItemT>;

  private eventFactory: EventFactory;
  private intervals: NodeJS.Timeout[] = [];
  private packetQueue: QueueItem<InworldPacketT>[] = [];
  private packetQueuePercievedLatency: InworldPacketT[] = [];

  private disconnectTimeoutId: NodeJS.Timeout;
  private reconnectTimeoutId: NodeJS.Timeout;

  private currentAudioConversation:
    | ConversationService<InworldPacketT>
    | undefined;

  readonly onDisconnect: () => Awaitable<void>;
  readonly onError: (err: InworldError) => Awaitable<void>;
  readonly onWarning: (message: InworldPacketT) => Awaitable<void>;
  readonly onMessage: (packet: ProtoPacket) => Awaitable<void>;
  readonly onReady: () => Awaitable<void>;
  readonly onHistoryChange: (
    history: HistoryItem[],
    props: HistoryChangedProps<HistoryItemT>,
  ) => Awaitable<void> | undefined;

  readonly history: InworldHistory;
  readonly conversations: Map<string, ConversationMapItem<InworldPacketT>> =
    new Map();
  private cancelResponses: CancelResponses = {};
  private extension: Extension<InworldPacketT, HistoryItemT>;

  // Store previous error to avoid multiple reconnection attempts.
  private previousError:
    | {
        attempts: number;
        status?: InworldStatus;
      }
    | undefined;
  // Store packets in progress to resend them on reconnection.
  private packetsInProgress: { [key: string]: () => ProtoPacket } = {};

  constructor(props?: ConnectionProps<InworldPacketT, HistoryItemT>) {
    this.connectionProps =
      props || ({} as ConnectionProps<InworldPacketT, HistoryItemT>);
    this.scene = new Scene({
      name: this.connectionProps.name,
    });

    this.history = new InworldHistory<InworldPacketT>({
      audioEnabled: props?.config?.capabilities.audio,
      extension: this.connectionProps.extension,
      user: this.connectionProps.user,
      scene: this.scene.name,
      conversations: this.conversations,
    });
    this.eventFactory = new EventFactory({
      validateData: this.connectionProps.config?.validateData,
    });

    // Bind handlers
    this.onReady = this.onReadyHandler.bind(this);
    this.onDisconnect = this.onDisconnectHandler.bind(this);
    this.onError = this.onErrorHandler.bind(this);
    this.onWarning = this.onWarningHandler.bind(this);
    this.onMessage = this.onMessageHandler.bind(this);
    this.onHistoryChange = this.connectionProps.onHistoryChange;

    this.initializeExtension();
    this.initializeConnection();
  }

  isActive() {
    return this.state === ConnectionState.ACTIVE;
  }

  isConnecting() {
    return [ConnectionState.ACTIVATING, ConnectionState.RECONNECTING].includes(
      this.state,
    );
  }

  isInactive() {
    return this.state === ConnectionState.INACTIVE;
  }

  isAutoReconnected() {
    return this.connectionProps.config?.connection?.autoReconnect ?? true;
  }

  getSceneName() {
    return this.scene.name;
  }

  getSessionId() {
    return this.session?.sessionId;
  }

  getCurrentAudioConversation() {
    return this.currentAudioConversation;
  }

  setCurrentAudioConversation(
    conversation?: ConversationService<InworldPacketT>,
  ) {
    this.currentAudioConversation = conversation;
  }

  async openManually() {
    try {
      if (this.isAutoReconnected()) {
        throw Error(
          'Impossible to open connection manually with `autoReconnect` enabled',
        );
      }

      if (!this.isInactive()) {
        throw Error('Connection is already open');
      }

      return this.open();
    } catch (err) {
      this.onError(err);
    }
  }

  async close() {
    this.cancelScheduler();
    this.cancelReconnectScheduler();
    this.state = ConnectionState.INACTIVE;
    await this.connection.close();
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

  getConfig() {
    return this.connectionProps.config;
  }

  async getCharacters() {
    await this.open();

    return this.scene.characters;
  }

  async getCurrentCharacter() {
    await this.open();

    return this.getEventFactory().getCurrentCharacter();
  }

  getCharactersByIds(ids: string[]) {
    return this.scene.getCharactersByIds(ids);
  }

  getCharactersByResourceNames(names: string[]) {
    return this.scene.getCharactersByResourceNames(names);
  }

  setCurrentCharacter(character: Character) {
    this.getEventFactory().setCurrentCharacter(character);
  }

  removeCharacters(names: string[]) {
    this.scene = new Scene({
      ...this.scene,
      characters: this.scene.characters.filter(
        (c) => !names.includes(c.resourceName),
      ),
    });
  }

  async open({ force }: { force?: boolean } = {}) {
    if (!force && !this.isInactive()) return;

    try {
      await this.loadToken();

      if (this.sceneIsLoaded) {
        await this.connection.reopenSession(this.session);
      } else {
        const { client, sessionContinuation, user } = this.connectionProps;

        const sessionProto = await this.connection.openSession({
          client,
          name: this.scene.name,
          sessionContinuation,
          user,
          session: this.session,
        });

        this.setSceneFromProtoEvent(sessionProto);

        if (this.scene.history?.length) {
          this.setPreviousState(this.scene.history);
        }
      }

      this.state = ConnectionState.ACTIVE;

      await this.reopenConversations();
      this.releaseQueue();
      await this.onReady?.();
      this.scheduleDisconnect();
    } catch (err) {
      this.onError(err);
    }
  }

  async change(name: string, props?: ChangeSceneProps) {
    if (!this.sceneIsLoaded) {
      throw Error('Unable to change scene that is not loaded yet');
    }

    this.connectionProps = {
      ...this.connectionProps,
      config: {
        ...this.connectionProps.config,
        ...(props?.capabilities && {
          capabilities: Capability.toProto(props.capabilities),
        }),
        ...(props?.gameSessionId && {
          gameSessionId: props.gameSessionId,
        }),
        ...(props?.user && {
          user: props.user,
        }),
      },
      sessionContinuation: props?.sessionContinuation
        ? new SessionContinuation(props.sessionContinuation)
        : undefined,
    };

    if (!this.isActive()) {
      await this.connection.reopenSession(this.session);
    }

    const sessionProto = await this.connection.updateSession({
      name: name !== this.getSceneName() ? name : undefined,
      capabilities: props?.capabilities,
      gameSessionId: props?.gameSessionId,
      sessionContinuation: this.connectionProps.sessionContinuation,
    });

    if (sessionProto) {
      this.setSceneFromProtoEvent(sessionProto);

      if (this.scene.history?.length) {
        this.setPreviousState(this.scene.history);
      }
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

  getAudioSessionAction() {
    return this.audioSessionAction;
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
          if (inworldPacket || this.isInactive()) {
            clearInterval(interval);

            this.intervals = this.intervals.filter(
              (i: NodeJS.Timeout) => i !== interval,
            );

            resolve(inworldPacket);
          }
        }, 10);
        this.intervals.push(interval);
      });

    const itemToSend: QueueItem<InworldPacketT> = {
      getPacket,
      afterWriting: (packet: InworldPacketT) => {
        inworldPacket = packet;
        this.afterWriting(inworldPacket);
      },
      beforeWriting: async (packet: InworldPacketT) =>
        this.beforeWriting(getPacket, packet),
    };

    if (this.isActive()) {
      this.connection.write(itemToSend);
    } else {
      this.packetQueue.push(itemToSend);

      await this.open();
    }

    return resolvePacket();
  }

  private afterWriting(packet: InworldPacketT) {
    this.scheduleDisconnect();
    this.addPacketToHistory(packet);
  }

  private async beforeWriting(
    getPacket: () => ProtoPacket,
    packet: InworldPacketT,
  ) {
    if (packet.isText()) {
      this.packetQueuePercievedLatency.push(packet);
      await this.interruptByPacket(packet);
    }

    if (packet.isText() || packet.isNarratedAction() || packet.isTrigger()) {
      this.packetsInProgress[packet.packetId.interactionId] = getPacket;
    }
  }

  private getActualCharacterId(target: Actor) {
    if (target.type !== ActorType.AGENT) {
      return target.name;
    }

    const resourceName = this.characterMapping[target.name];

    return (
      this.scene.getCharactersByResourceNames([resourceName])?.[0]?.id ??
      target.name
    );
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
    if (!this.session?.expirationTime || SessionToken.isExpired(this.session)) {
      const { sessionId } = this.session || {};

      props?.beforeLoading?.();
      let sessionToken = await this.connectionProps.generateSessionToken();

      // Reuse session id to keep context of previous conversation
      if (sessionId) {
        sessionToken = {
          ...sessionToken,
          sessionId,
        };
      }

      this.session = sessionToken;
    }

    return this.session;
  }

  addInterval(interval: NodeJS.Timeout) {
    this.intervals.push(interval);
  }

  removeInterval(interval: NodeJS.Timeout) {
    this.intervals = this.intervals.filter((i) => i !== interval);
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

  private setPreviousState(history: SceneHistoryItem[]) {
    history.forEach(({ packet, character }) =>
      this.history.addOrUpdate({
        grpcAudioPlayer: this.connectionProps.grpcAudioPlayer,
        characters: this.eventFactory.getCharacters(),
        packet: this.extension.convertPacketFromProto(packet),
        fromHistory: true,
        fromHistoryCharacter: character,
      }),
    );

    const diff = this.history.get() as HistoryItemT[];

    this.onHistoryChange?.(diff, { diff: { added: diff } });
  }

  private cancelScheduler() {
    if (this.disconnectTimeoutId) {
      clearTimeout(this.disconnectTimeoutId);
    }
  }

  private cancelReconnectScheduler() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }
  }

  private reopenConversations() {
    const resolveConversations = () =>
      new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          let active = true;
          this.conversations.forEach((conversation) => {
            if (conversation.state !== ConversationState.ACTIVE) {
              active = false;
            }
          });

          if (active) {
            clearInterval(interval);

            this.intervals = this.intervals.filter(
              (i: NodeJS.Timeout) => i !== interval,
            );

            resolve();
          }
        }, 10);
        this.intervals.push(interval);
      });

    let sent = false;
    this.conversations.forEach((conversation) => {
      if (conversation.state === ConversationState.INACTIVE) {
        conversation.service.updateParticipants(
          conversation.service.getParticipants(),
        );
        sent = true;
      }
    });

    return sent ? resolveConversations() : Promise.resolve();
  }

  private releaseQueue() {
    this.packetQueue.forEach((item: QueueItem<InworldPacketT>) =>
      this.connection.write(item),
    );

    this.packetQueue = [];
    this.characterMapping = {};
  }

  private clearQueue() {
    this.intervals.forEach((i: NodeJS.Timeout) => {
      clearInterval(i);
    });

    this.intervals = [];
    this.packetQueue = [];
    this.packetQueuePercievedLatency = [];
  }

  private async onReadyHandler() {
    this.connectionProps.onReady?.();
  }

  private async onDisconnectHandler() {
    this.state = ConnectionState.INACTIVE;
    this.audioSessionAction = AudioSessionState.UNKNOWN;
    this.conversations.forEach((conversation) => {
      conversation.state = ConversationState.INACTIVE;
    });

    await this.connectionProps.onDisconnect?.();
  }

  private async onErrorHandler(err: InworldError) {
    this.state = ConnectionState.INACTIVE;

    const status = err.details?.[0];
    const interactionIds = Object.keys(this.packetsInProgress);
    let needToReopen =
      !!interactionIds.length &&
      [ErrorReconnectionType.IMMEDIATE, ErrorReconnectionType.TIMEOUT].includes(
        status?.reconnectType,
      );

    // Change internal state based on error type.
    switch (status?.errorType) {
      case ErrorType.AUDIO_SESSION_EXPIRED:
        this.setAudioSessionAction(AudioSessionState.UNKNOWN);
        break;
      case ErrorType.SESSION_TOKEN_EXPIRED:
      case ErrorType.SESSION_TOKEN_INVALID:
        this.session = {
          ...this.session,
          expirationTime: undefined,
        };
        needToReopen = true;
        status.reconnectType = ErrorReconnectionType.IMMEDIATE;
        break;
      case ErrorType.SESSION_INVALID:
        this.session = undefined;
        this.sceneIsLoaded = false;
        this.characterMapping = this.scene.characters.reduce(
          (acc, character) => ({
            ...acc,
            [character.id]: character.resourceName,
          }),
          this.characterMapping,
        );
        this.scene = new Scene({
          name: this.getSceneName(),
        });
        needToReopen = true;
        status.reconnectType = ErrorReconnectionType.IMMEDIATE;
        break;
    }

    // Check if the same error occurs multiple times.
    const sameError =
      !!this.previousError?.status &&
      !!status &&
      objectsAreEqual<InworldStatus>(this.previousError.status, status, [
        'errorType',
        'reconnectType',
        'reconnectTime',
        'maxRetries',
      ]);
    this.previousError = sameError
      ? {
          attempts: this.previousError.attempts + 1,
          status: this.previousError.status,
        }
      : { attempts: 0, status };

    // If the same error occurs multiple times (> maxRetries), we need to stop reconnection attempts.
    // Also, we need to stop reconnection attempts if the reconnection is impossible due some reasons.
    if (
      (sameError && this.previousError.attempts >= (status.maxRetries ?? 0)) ||
      !status ||
      (status &&
        ![
          ErrorReconnectionType.IMMEDIATE,
          ErrorReconnectionType.TIMEOUT,
        ].includes(status.reconnectType))
    ) {
      needToReopen = false;
      const id = interactionIds.pop();

      if (id) {
        delete this.packetsInProgress[id];
      }
    }

    if (!needToReopen) {
      const handler =
        this.connectionProps.onError ??
        (() => {
          console.error(err);
        });
      handler(err);
      return;
    }

    this.history.filter({
      history: (item: HistoryItemT) =>
        !interactionIds.includes(item.interactionId),
      queue: (item: HistoryItemT) =>
        !interactionIds.includes(item.interactionId),
    }) as HistoryItemT[];

    this.state = ConnectionState.RECONNECTING;

    const delay = status.reconnectTime
      ? new Date(status.reconnectTime).getTime() - Date.now()
      : 0;
    this.packetQueue = [...this.getPacketsToSentOnOpen(), ...this.packetQueue];

    if (status.reconnectType === ErrorReconnectionType.TIMEOUT && delay > 0) {
      this.cancelReconnectScheduler();
      this.reconnectTimeoutId = setTimeout(() => {
        this.open({ force: true });
      }, delay);
    } else {
      this.open({ force: true });
    }
  }

  private async onWarningHandler(message: InworldPacketT) {
    const handler =
      this.connectionProps.onWarning ??
      ((message: InworldPacketT) => {
        if (message.control?.description) {
          console.warn(message.control.description);
        }
      });

    return handler(message);
  }

  private async onMessageHandler(packet: ProtoPacket) {
    const { onMessage, grpcAudioPlayer } = this.connectionProps;
    const inworldPacket = this.extension.convertPacketFromProto(packet);
    const interactionId = inworldPacket.packetId.interactionId;
    const conversationId = inworldPacket.packetId.conversationId;
    const conversation =
      conversationId && this.conversations.get(conversationId);

    // Skip packets that are not attached to any conversation.
    if (inworldPacket.shouldHaveConversationId() && !conversation) {
      // Pass packet to external callback.
      onMessage?.(inworldPacket);
      return;
    }

    // Update session state.
    if (
      packet.control?.action === ControlEventAction.CURRENT_SCENE_STATUS &&
      packet.control.currentSceneStatus
    ) {
      this.setSceneFromProtoEvent({
        sceneStatus: packet.control.currentSceneStatus,
      } as LoadedScene);
    }

    // Update conversation state.
    if (inworldPacket.control?.conversation && conversation) {
      this.conversations.set(inworldPacket.packetId.conversationId, {
        service: conversation.service,
        state: [
          InworldConversationEventType.STARTED,
          InworldConversationEventType.UPDATED,
        ].includes(inworldPacket.control.conversation.type)
          ? ConversationState.ACTIVE
          : ConversationState.INACTIVE,
      });
    }

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
        conversationId,
      );

      return;
    }

    // Send cancel response event in case of player talking.
    if (inworldPacket.isText() && inworldPacket.routing.source.isPlayer) {
      await this.interruptByPacket(inworldPacket);
      // Play audio or silence.
    } else if (inworldPacket.isAudio() || inworldPacket.isSilence()) {
      if (!this.cancelResponses[interactionId]) {
        this.addPacketToHistory(inworldPacket);
        grpcAudioPlayer.addToQueue({
          packet: inworldPacket,
          onBeforePlaying: (packet: InworldPacketT) => {
            const diff = this.history.update(packet) as HistoryItemT[];

            if (diff.length) {
              this.onHistoryChange?.(this.getHistory(), {
                diff: { added: diff },
                conversationId,
              });
            }
          },
          onAfterPlaying: (packet: InworldPacketT) => {
            const diff = this.history.update(packet) as HistoryItemT[];

            if (diff.length) {
              this.onHistoryChange?.(this.getHistory(), {
                diff: { added: diff },
                conversationId: packet.packetId.conversationId,
              });
            }
          },
        });
      }
      // Delete info about cancel responses on interaction end.
    } else if (inworldPacket.isInteractionEnd()) {
      // Delete packet that was successfully applied on the server side.
      delete this.packetsInProgress[interactionId];
      // Clear previous error.
      this.previousError = undefined;
      // Delete cancel responses.
      delete this.cancelResponses[interactionId];
    } else if (inworldPacket.isWarning()) {
      this.onWarning(inworldPacket);
    }

    // Send percieved latency report
    if (
      inworldPacket.isText() &&
      !inworldPacket.routing.source.isPlayer &&
      this.packetQueuePercievedLatency.length > 0
    ) {
      let packetQueuePercievedLatencyIndex: number = -1;
      for (let i = 0; i < this.packetQueuePercievedLatency.length; i++) {
        const packetSent = this.packetQueuePercievedLatency[i];
        if (
          packet.packetId.correlationId &&
          packet.packetId.correlationId === packetSent.packetId.correlationId
        ) {
          packetQueuePercievedLatencyIndex = i;
          break;
        }
      }
      if (packetQueuePercievedLatencyIndex > -1) {
        const packetSent: InworldPacketT =
          this.packetQueuePercievedLatency[packetQueuePercievedLatencyIndex];
        const durationMilliseconds =
          new Date(packet.timestamp).getTime() -
          new Date(packetSent.date).getTime();
        let durationSeconds = Math.floor(durationMilliseconds / 1000);
        let durationNanos = Math.round(
          (durationMilliseconds / 1000 - durationSeconds) * 1000000000,
        );

        if (durationSeconds < 0 && durationNanos > 0) {
          durationSeconds += 1;
          durationNanos -= 1000000000;
        } else if (durationSeconds > 0 && durationNanos < 0) {
          durationSeconds -= 1;
          durationNanos += 1000000000;
        }

        this.sendPerceivedLatencyReport(durationSeconds, durationNanos);
        this.packetQueuePercievedLatency.splice(
          packetQueuePercievedLatencyIndex,
          1,
        );
      }
    }

    // Add packet to history.
    // Audio and silence packets were added to history earlier.
    if (!inworldPacket.isAudio() && !inworldPacket.isSilence()) {
      this.addPacketToHistory(inworldPacket);
    }

    // Handle latency ping pong.
    if (inworldPacket.isPingPongReport()) {
      this.sendPingPongResponse(inworldPacket);
      // Don't pass text packet outside.
      return;
    }

    // Pass packet to external callback.
    onMessage?.(inworldPacket);
  }

  private initializeConnection() {
    const { config, webRtcLoopbackBiDiSession, grpcAudioPlayer } =
      this.connectionProps;

    this.connection = new WebSocketConnection<InworldPacketT, HistoryItemT>({
      config,
      onDisconnect: this.onDisconnect,
      onReady: async () => {
        await webRtcLoopbackBiDiSession.startSession(
          new MediaStream(),
          grpcAudioPlayer.getPlaybackStream(),
        );

        this.player.setStream(
          webRtcLoopbackBiDiSession.getPlaybackLoopbackStream(),
        );
      },
      onError: this.onError,
      onMessage: this.onMessage,
      extension: this.extension,
      eventFactory: this.eventFactory,
    });
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
      const { interactionId, conversationId } = packets[0].packetId;

      this.sendCancelResponses(
        {
          interactionId,
          utteranceId: packets.map(
            (packet: InworldPacketT) => packet.packetId.utteranceId,
          ),
        },
        conversationId,
      );
    }
  }

  private sendCancelResponses(
    cancelResponses: CancelResponsesProps,
    conversationId: string,
  ) {
    const characters =
      this.conversations.get(conversationId)?.service.getCharacters() ?? [];

    if (cancelResponses.interactionId && characters.length === 1) {
      this.send(() => this.getEventFactory().cancelResponse(cancelResponses));

      this.cancelResponses = {
        ...this.cancelResponses,
        [cancelResponses.interactionId]: true,
      };

      const interruptionData = {
        utteranceId: cancelResponses.utteranceId ?? [],
        interactionId: cancelResponses.interactionId,
      };

      this.connectionProps.onInterruption?.(interruptionData);

      this.history.filter({
        history: (item: HistoryItem) =>
          !interruptionData.utteranceId.includes(item.id),
        queue: (item: HistoryItem) =>
          item.interactionId !== interruptionData.interactionId &&
          !interruptionData.utteranceId.includes(item.id),
      });
    }
  }

  private sendPingPongResponse(packet: InworldPacketT) {
    this.send(() =>
      this.getEventFactory().pong(
        packet.packetId,
        packet.latencyReport.pingPong.pingTimestamp,
      ),
    );
  }

  private sendPerceivedLatencyReport(seconds: number, nanos: number) {
    this.send(() => this.getEventFactory().perceivedLatency(seconds, nanos));
  }

  private addPacketToHistory(packet: InworldPacketT) {
    const diff = this.history.addOrUpdate({
      grpcAudioPlayer: this.connectionProps.grpcAudioPlayer,
      characters: this.eventFactory.getCharacters(),
      packet,
    }) as HistoryItemT[];

    if (diff.length) {
      this.onHistoryChange?.(this.getHistory(), {
        diff: { added: diff },
        conversationId: packet.packetId.conversationId,
      });
    }
  }

  private getPacketsToSentOnOpen() {
    let packets: QueueItem<InworldPacketT>[] = [];

    if (this.state === ConnectionState.RECONNECTING) {
      const notAppliedPackets = { ...this.packetsInProgress };
      const cancellationPackets: QueueItem<InworldPacketT>[] = [];
      const reconnectionPackets: QueueItem<InworldPacketT>[] = [];

      const history = this.history.get();
      const lastItem = history[history.length - 1];

      this.packetsInProgress = {};

      if (lastItem?.interactionId) {
        cancellationPackets.push({
          getPacket: () =>
            this.getEventFactory().cancelResponse({
              interactionId: lastItem.interactionId,
            }),
        });
      }

      Object.keys(notAppliedPackets).forEach((interactionId) => {
        const getPacket = notAppliedPackets[interactionId];

        reconnectionPackets.push({
          getPacket,
          afterWriting: this.afterWriting.bind(this),
          beforeWriting: (packet: InworldPacketT) =>
            this.beforeWriting(getPacket, packet),
          convertPacket: (proto: ProtoPacket) => {
            if (proto.routing?.target) {
              proto.routing.target.name = this.getActualCharacterId(
                proto.routing.target,
              );
            } else if (proto.routing?.targets?.length) {
              proto.routing.targets = proto.routing.targets.map((target) => {
                target.name = this.getActualCharacterId(target);

                return target;
              });
            }

            return proto;
          },
        });
      });

      packets = [...cancellationPackets, ...packets, ...reconnectionPackets];
    }

    return packets;
  }

  private ensureCurrentCharacter() {
    const factory = this.getEventFactory();
    const currentCharacter = factory.getCurrentCharacter();
    const sameCharacter = currentCharacter
      ? this.scene.characters.find(
          (c) => c.resourceName === currentCharacter?.resourceName,
        )
      : undefined;

    factory.setCurrentCharacter(sameCharacter ?? this.scene.characters[0]);
    factory.setCharacters(this.scene.characters);
  }

  private setSceneFromProtoEvent(proto: LoadedScene) {
    this.sceneIsLoaded = true;
    this.scene = Scene.fromProto({
      sceneStatus: proto.sceneStatus,
      sessionHistory: proto.sessionHistory,
    });

    this.connectionProps.extension?.afterLoadScene?.(proto.sceneStatus);
    this.ensureCurrentCharacter();
  }
}
