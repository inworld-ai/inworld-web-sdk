import { InworldPacket as ProtoPacket } from '../../proto/packets.pb';
import { LoadSceneResponseAgent } from '../../proto/world-engine.pb';
import {
  ClientRequest,
  LoadSceneResponse,
  UserRequest,
} from '../../proto/world-engine.pb';
import {
  AudioSessionState,
  Awaitable,
  CancelResponses,
  CancelResponsesProps,
  ConnectionState,
  GenerateSessionTokenFn,
  InternalClientConfiguration,
  SessionToken,
  VoidFn,
} from '../common/interfaces';
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
  WebSocketConnection,
} from '../connection/web-socket.connection';
import { Character } from '../entities/character.entity';
import { InworldPacket } from '../entities/inworld_packet.entity';
import { EventFactory } from '../factories/event';
import { WorldEngineService } from './world_engine.service';

interface ConnectionProps {
  name?: string;
  user?: UserRequest;
  client?: ClientRequest;
  config?: InternalClientConfiguration;
  onReady?: () => Awaitable<void>;
  onError?: (err: Event | Error) => void;
  onMessage?: (packet: InworldPacket) => Awaitable<void>;
  onDisconnect?: VoidFn;
  onHistoryChange?: (history: HistoryItem[]) => Awaitable<void>;
  grpcAudioPlayer: GrpcAudioPlayback;
  webRtcLoopbackBiDiSession: GrpcWebRtcLoopbackBiDiSession;
  generateSessionToken: GenerateSessionTokenFn;
}

const TIME_DIFF_MS = 50 * 60 * 1000; // 5 minutes

const player = Player.getInstance();

export class ConnectionService {
  private state: ConnectionState = ConnectionState.INACTIVE;
  private audioSessionAction = AudioSessionState.UNKNOWN;

  private scene: LoadSceneResponse;
  private session: SessionToken;
  private connection: Connection;
  private connectionProps: ConnectionProps;

  private characters: Array<Character> = [];

  private intervals: NodeJS.Timeout[] = [];
  private disconnectTimeoutId: NodeJS.Timeout;

  private eventFactory = new EventFactory();

  private onDisconnect: VoidFn;
  private onError: (err: Event | Error) => void;
  private onMessage: ((packet: ProtoPacket) => Awaitable<void>) | undefined;
  private onReady: (() => Awaitable<void>) | undefined;

  private cancelReponses: CancelResponses = {};
  private history = new InworldHistory();

  constructor(props?: ConnectionProps) {
    this.connectionProps = props || ({} as ConnectionProps);

    this.initializeHandlers();
    this.initializeConnection();
  }

  isActive() {
    return this.state === ConnectionState.ACTIVE;
  }

  isAutoReconnected() {
    return this.connectionProps.config?.connection?.autoReconnect ?? true;
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
    return this.history.getTranscript(this.connectionProps.user);
  }

  async getCharactersList() {
    await this.loadScene();

    return this.characters;
  }

  async open() {
    try {
      await this.loadScene();

      if (this.state === ConnectionState.LOADED) {
        this.state = ConnectionState.ACTIVATING;

        await this.connection.open({
          characters: this.characters.map((c) => c.id),
          session: this.session,
        });

        this.scheduleDisconnect();
      }
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

  getAudioSessionAction() {
    return this.audioSessionAction;
  }

  interrupt() {
    const packet = this.connectionProps.grpcAudioPlayer.getCurrentPacket();

    if (packet) {
      this.interruptByInteraction(packet.packetId.interactionId);
    }
  }

  private async loadCharactersList() {
    if (!this.scene) {
      await this.loadScene();
    }

    this.characters = (this.scene?.agents || [])?.map(
      (agent: LoadSceneResponseAgent) =>
        new Character({
          id: agent.agentId,
          resourceName: agent.brainName,
          displayName: agent.givenName,
          assets: {
            avatarImg: agent.characterAssets.avatarImg,
            avatarImgOriginal: agent.characterAssets.avatarImgOriginal,
            rpmModelUri: agent.characterAssets.rpmModelUri,
            rpmImageUriPortrait: agent.characterAssets.rpmImageUriPortrait,
            rpmImageUriPosture: agent.characterAssets.rpmImageUriPosture,
          },
        }),
    );

    if (!this.getEventFactory().getCurrentCharacter() && this.characters[0]) {
      this.getEventFactory().setCurrentCharacter(this.characters[0]);
    }
  }

  private async write(getPacket: () => ProtoPacket) {
    let inworldPacket: InworldPacket;

    const resolvePacket = () =>
      new Promise<InworldPacket>((resolve) => {
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

    // 1. Send a packet to a connection.
    // The packet will be sent directly or added to the queue.
    // If the connection is not active, we need to add the packet to the queue first to guarantee the order of packets.
    this.connection.write({
      getPacket,
      afterWriting: (packet: ProtoPacket) => {
        inworldPacket = InworldPacket.fromProto(packet);

        this.scheduleDisconnect();

        if (inworldPacket.isText()) {
          this.interruptByInteraction(inworldPacket.packetId.interactionId);
        }

        this.addPacketToHistory(inworldPacket);
      },
    });

    // 2. Open the connection if it's inactive.
    if (!this.isActive()) {
      this.open();
    }

    return resolvePacket();
  }

  private async loadScene() {
    if (this.state === ConnectionState.LOADING) return;

    const { generateSessionToken, name, client, user } = this.connectionProps;

    try {
      const { sessionId, expirationTime } = this.session || {};

      // Generate new session token is it's empty or expired
      if (
        !expirationTime ||
        new Date(expirationTime).getTime() - new Date().getTime() <=
          TIME_DIFF_MS
      ) {
        this.state = ConnectionState.LOADING;
        this.session = await generateSessionToken();

        // Reuse session id to keep context of previous conversation
        if (sessionId) {
          this.session = {
            ...this.session,
            sessionId,
          };
        }
      }

      const engineService = new WorldEngineService();

      if (!this.scene) {
        this.scene = await engineService.loadScene({
          config: this.connectionProps.config,
          session: this.session,
          name,
          user,
          client,
        });

        await this.loadCharactersList();
      }

      if (
        [ConnectionState.LOADING, ConnectionState.INACTIVE].includes(this.state)
      ) {
        this.state = ConnectionState.LOADED;
      }
    } catch (err) {
      this.onError(err);
    }
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

  private cancelScheduler() {
    if (this.disconnectTimeoutId) {
      clearTimeout(this.disconnectTimeoutId);
    }
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
      player.setStream(webRtcLoopbackBiDiSession.getPlaybackLoopbackStream());
      this.state = ConnectionState.ACTIVE;
      onReady?.();
    };

    this.onDisconnect = () => {
      this.state = ConnectionState.INACTIVE;
      this.audioSessionAction = AudioSessionState.UNKNOWN;
      onDisconnect?.();
    };

    this.onError = onError ?? ((event: Event | Error) => console.error(event));

    this.onMessage = async (packet: ProtoPacket) => {
      const { onMessage, grpcAudioPlayer } = this.connectionProps;

      const inworldPacket = InworldPacket.fromProto(packet);
      const interactionId = inworldPacket.packetId.interactionId;

      // Don't pass text packet outside for interrupred interaction.
      if (
        inworldPacket.isText() &&
        !inworldPacket.routing.source.isPlayer &&
        this.cancelReponses[interactionId]
      ) {
        // Try to find and update packet that is already displayed in history.
        const updated = this.updatePacketInHistory(inworldPacket);

        if (updated) {
          // Pass packet to external callback.
          onMessage?.(inworldPacket);
        } else {
          this.sendCancelResponses({
            interactionId,
            utteranceId: [packet.packetId.utteranceId],
          });
        }

        return;
      }

      // Send cancel response event in case of player talking.
      if (inworldPacket.isText() && inworldPacket.routing.source.isPlayer) {
        this.interruptByInteraction(inworldPacket.packetId.interactionId);
      }

      // Play audio or silence.
      if (inworldPacket.isAudio() || inworldPacket.isSilence()) {
        if (!this.cancelReponses[interactionId]) {
          grpcAudioPlayer.addToQueue({
            packet: inworldPacket,
            onBeforePlaying: (packet: InworldPacket) => {
              this.displayPlacketInHistory(packet, CHAT_HISTORY_TYPE.ACTOR);
              this.displayPlacketInHistory(
                packet,
                CHAT_HISTORY_TYPE.NARRATED_ACTION,
              );
            },
            onAfterPlaying: (packet: InworldPacket) => {
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
        delete this.cancelReponses[interactionId];
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

  private interruptByInteraction(interactionId: string) {
    const { grpcAudioPlayer, config } = this.connectionProps;

    if (!config?.capabilities.interruptions) return;

    const packets =
      grpcAudioPlayer.excludeCurrentInteractionPackets(interactionId);

    if (!grpcAudioPlayer.isCurrentPacket({ interactionId })) {
      grpcAudioPlayer.stop();
    }

    if (packets.length) {
      const interactionId = packets[0].packetId.interactionId;

      this.sendCancelResponses({
        interactionId,
        utteranceId: packets.map(
          (packet: InworldPacket) => packet.packetId.utteranceId,
        ),
      });
    }
  }

  private sendCancelResponses(cancelReponses: CancelResponsesProps) {
    if (cancelReponses.interactionId) {
      this.send(() => this.getEventFactory().cancelResponse(cancelReponses));

      this.cancelReponses = {
        ...this.cancelReponses,
        [cancelReponses.interactionId]: true,
      };

      this.history.filter({
        utteranceId: cancelReponses.utteranceId ?? [],
        interactionId: cancelReponses.interactionId,
      });
    }
  }

  private addPacketToHistory(packet: InworldPacket) {
    const changed = this.history.addOrUpdate({
      grpcAudioPlayer: this.connectionProps.grpcAudioPlayer,
      characters: this.characters,
      packet,
    });

    if (changed) {
      this.connectionProps.onHistoryChange?.(this.getHistory());
    }
  }

  private updatePacketInHistory(packet: InworldPacket) {
    const changed = this.history.update(packet);

    if (changed) {
      this.connectionProps.onHistoryChange?.(this.getHistory());
    }

    return changed;
  }

  private displayPlacketInHistory(
    packet: InworldPacket,
    type:
      | CHAT_HISTORY_TYPE.ACTOR
      | CHAT_HISTORY_TYPE.INTERACTION_END
      | CHAT_HISTORY_TYPE.NARRATED_ACTION,
  ) {
    const changed = this.history.display(packet, type);

    if (changed) {
      this.connectionProps.onHistoryChange?.(this.getHistory());
    }
  }

  private clearQueue() {
    this.intervals.forEach((i: NodeJS.Timeout) => {
      clearInterval(i);
    });

    this.intervals = [];
  }
}
