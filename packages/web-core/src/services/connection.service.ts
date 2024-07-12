import { ClientRequest } from '../../proto/ai/inworld/engine/world-engine.pb';
import {
  ControlEventAction,
  InworldPacket as ProtoPacket,
  SessionControlResponseEvent,
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
  User,
} from '../common/data_structures';
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
import { ErrorType, InworldError } from '../entities/error.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { Scene } from '../entities/scene.entity';
import { SessionToken } from '../entities/session_token.entity';
import { EventFactory } from '../factories/event';
import { ConversationService } from './conversation.service';
import { StateSerializationService } from './pb/state_serialization.service';

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
  private sceneIsLoaded = false;
  private session: SessionToken;
  private connection: Connection<InworldPacketT>;
  private connectionProps: ConnectionProps<InworldPacketT, HistoryItemT>;

  private eventFactory = new EventFactory();
  private intervals: NodeJS.Timeout[] = [];
  private packetQueue: QueueItem<InworldPacketT>[] = [];

  private disconnectTimeoutId: NodeJS.Timeout;

  private stateService = new StateSerializationService();
  private currentAudioConversation:
    | ConversationService<InworldPacketT>
    | undefined;

  onDisconnect: () => Awaitable<void>;
  onError: (err: InworldError) => Awaitable<void>;
  onWarning: (message: InworldPacketT) => Awaitable<void>;
  onMessage: (packet: ProtoPacket) => Awaitable<void>;
  onReady: () => Awaitable<void>;
  onHistoryChange: (
    history: HistoryItem[],
    props: HistoryChangedProps<HistoryItemT>,
  ) => Awaitable<void> | undefined;

  readonly history: InworldHistory;
  readonly conversations: Map<string, ConversationMapItem<InworldPacketT>> =
    new Map();
  private cancelResponses: CancelResponses = {};
  private extension: Extension<InworldPacketT, HistoryItemT>;

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

    this.initializeHandlers();
    this.initializeExtension();
    this.initializeConnection();
  }

  isActive() {
    return this.state === ConnectionState.ACTIVE;
  }

  isAutoReconnected() {
    return this.connectionProps.config?.connection?.autoReconnect ?? true;
  }

  getSceneName() {
    return this.scene.name;
  }

  getCurrentAudioConversation() {
    return this.currentAudioConversation;
  }

  setCurrentAudioConversation(
    conversation?: ConversationService<InworldPacketT>,
  ) {
    this.currentAudioConversation = conversation;
  }

  async getSessionState() {
    try {
      const { config } = this.connectionProps;
      const session = await this.ensureSessionToken();

      return this.stateService.getSessionState({
        config,
        session,
        scene: this.scene.name,
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

  async close() {
    this.cancelScheduler();
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

  async open() {
    if (this.state !== ConnectionState.INACTIVE) return;

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
      name,
      capabilities: props?.capabilities,
      gameSessionId: props?.gameSessionId,
      sessionContinuation: this.connectionProps.sessionContinuation,
    });

    this.setSceneFromProtoEvent(sessionProto);

    if (this.scene.history?.length) {
      this.setPreviousState(this.scene.history);
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

  private setPreviousState(previousPackets: ProtoPacket[]) {
    previousPackets.forEach((packet) =>
      this.history.addOrUpdate({
        grpcAudioPlayer: this.connectionProps.grpcAudioPlayer,
        characters: this.eventFactory.getCharacters(),
        packet: this.extension.convertPacketFromProto(packet),
        fromHistory: true,
      }),
    );

    const diff = this.history.get() as HistoryItemT[];

    this.onHistoryChange?.(diff, { diff });
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
    const { onError, onReady, onWarning, onDisconnect } = this.connectionProps;

    this.onReady = async () => {
      this.state = ConnectionState.ACTIVE;
      onReady?.();
    };

    this.onDisconnect = async () => {
      this.state = ConnectionState.INACTIVE;
      this.audioSessionAction = AudioSessionState.UNKNOWN;
      this.conversations.forEach((conversation) => {
        conversation.state = ConversationState.INACTIVE;
      });

      await onDisconnect?.();
    };

    this.onError = (err: InworldError) => {
      const handler = onError ?? console.error;

      if (err.details?.[0]?.errorType === ErrorType.AUDIO_SESSION_EXPIRED) {
        this.setAudioSessionAction(AudioSessionState.UNKNOWN);
      }

      handler(err);
    };
    this.onWarning =
      onWarning ??
      ((message: InworldPacketT) => {
        if (message.control?.description) {
          console.warn(message.control.description);
        }
      });

    this.onMessage = async (packet: ProtoPacket) => {
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
                  diff,
                  conversationId,
                });
              }
            },
            onAfterPlaying: (packet: InworldPacketT) => {
              const diff = this.history.update(packet) as HistoryItemT[];

              if (diff.length) {
                this.onHistoryChange?.(this.getHistory(), {
                  diff,
                  conversationId: packet.packetId.conversationId,
                });
              }
            },
          });
        }
        // Delete info about cancel responses on interaction end.
      } else if (inworldPacket.isInteractionEnd()) {
        delete this.cancelResponses[interactionId];
      } else if (inworldPacket.isWarning()) {
        this.onWarning(inworldPacket);
      }

      // Add packet to history.
      // Audio and silence packets were added to history earlier.
      if (!inworldPacket.isAudio() && !inworldPacket.isSilence()) {
        this.addPacketToHistory(inworldPacket);
      }

      // Pass packet to external callback.
      onMessage?.(inworldPacket);
    };

    this.onHistoryChange = this.connectionProps.onHistoryChange;
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
      this.send(() =>
        this.getEventFactory().cancelResponse({
          ...cancelResponses,
          character: characters[0],
        }),
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
    const diff = this.history.addOrUpdate({
      grpcAudioPlayer: this.connectionProps.grpcAudioPlayer,
      characters: this.eventFactory.getCharacters(),
      packet,
    }) as HistoryItemT[];

    if (diff.length) {
      this.onHistoryChange?.(this.getHistory(), {
        diff,
        conversationId: packet.packetId.conversationId,
      });
    }
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

  private addCharactersToScene(proto: SessionControlResponseEvent) {
    const characters = proto.loadedCharacters.agents.map((c) =>
      Character.fromProto(c),
    );

    const ids = this.scene.characters.reduce(
      (acc: { [key: string]: boolean }, character) => {
        acc[character.id] = true;
        return acc;
      },
      {},
    );

    for (const character of characters) {
      if (!ids[character.id]) {
        this.scene.characters.push(character);
      }
    }

    this.ensureCurrentCharacter();
  }
}
