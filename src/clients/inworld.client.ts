import { CapabilitiesRequest } from '../../proto/ai/inworld/engine/world-engine.pb';
import { CancelResponses } from '../../proto/ai/inworld/packets/packets.pb';
import { GRPC_HOSTNAME, SCENE_PATTERN } from '../common/constants';
import {
  Awaitable,
  Capabilities,
  Client,
  ClientConfiguration,
  Extension,
  Gateway,
  GenerateSessionTokenFn,
  InternalClientConfiguration,
  OnPhomeneFn,
  User,
} from '../common/data_structures';
import { HistoryItem } from '../components/history';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import {
  SessionContinuation,
  SessionContinuationProps,
} from '../entities/continuation/session_continuation.entity';
import { InworldPacket } from '../entities/inworld_packet.entity';
import { isNaturalNumber } from '../guard/number';
import { ConnectionService } from '../services/connection.service';
import { InworldConnectionService } from '../services/inworld_connection.service';

export class InworldClient<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> {
  private user: User;
  private scene: string = '';
  private client: Client;
  private config: ClientConfiguration = {};
  private sessionContinuation: SessionContinuation;

  private generateSessionToken: GenerateSessionTokenFn;

  private onDisconnect: () => Awaitable<void> | undefined;
  private onError: ((err: Event | Error) => Awaitable<void>) | undefined;
  private onMessage: ((message: InworldPacketT) => Awaitable<void>) | undefined;
  private onReady: (() => Awaitable<void>) | undefined;
  private onHistoryChange:
    | ((history: HistoryItem[]) => Awaitable<void>)
    | undefined;
  private onInterruption:
    | ((props: CancelResponses) => Awaitable<void>)
    | undefined;
  private onPhoneme: OnPhomeneFn;

  private onAfterPlaying:
    | ((message: InworldPacketT) => Awaitable<void>)
    | undefined;
  private onBeforePlaying:
    | ((message: InworldPacketT) => Awaitable<void>)
    | undefined;
  private onStopPlaying: (() => Awaitable<void>) | undefined;

  private extension: Extension<InworldPacketT, HistoryItemT>;

  setUser(user: User) {
    this.user = user;

    return this;
  }

  setClient(client: Client) {
    this.client = {
      id: client.id,
    };

    return this;
  }

  setGenerateSessionToken(generateSessionToken: GenerateSessionTokenFn) {
    this.generateSessionToken = generateSessionToken;

    return this;
  }

  setConfiguration(config: ClientConfiguration) {
    this.config = config;

    return this;
  }

  setScene(name: string) {
    this.scene = name;

    return this;
  }

  setOnDisconnect(fn?: () => Awaitable<void>) {
    this.onDisconnect = fn;

    return this;
  }

  setOnError(fn?: (err: Error) => Awaitable<void>) {
    this.onError = fn;

    return this;
  }

  setOnMessage(fn?: (message: InworldPacketT) => Awaitable<void>) {
    this.onMessage = fn;

    return this;
  }

  setOnReady(fn?: () => Awaitable<void>) {
    this.onReady = fn;

    return this;
  }

  setOnHistoryChange(fn?: (history: HistoryItemT[]) => Awaitable<void>) {
    this.onHistoryChange = fn;

    return this;
  }

  setOnInterruption(fn?: (props: CancelResponses) => Awaitable<void>) {
    this.onInterruption = fn;

    return this;
  }

  setOnPhoneme(fn?: OnPhomeneFn) {
    this.onPhoneme = fn;

    return this;
  }

  setOnAfterPlaying(fn?: (message: InworldPacketT) => Awaitable<void>) {
    this.onAfterPlaying = fn;

    return this;
  }

  setOnBeforePlaying(fn?: (message: InworldPacketT) => Awaitable<void>) {
    this.onBeforePlaying = fn;

    return this;
  }

  setOnStopPlaying(fn?: () => Awaitable<void>) {
    this.onStopPlaying = fn;

    return this;
  }

  setExtension(extension: Extension<InworldPacketT, HistoryItemT>) {
    this.extension = extension;

    return this;
  }

  setSessionContinuation(sessionContinuation: SessionContinuationProps) {
    this.sessionContinuation = new SessionContinuation(sessionContinuation);

    return this;
  }

  build() {
    this.validate();

    const config = this.buildConfiguration();

    const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();
    const grpcAudioRecorder = new GrpcAudioRecorder();
    const grpcAudioPlayer = new GrpcAudioPlayback<InworldPacketT>({
      audioPlaybackConfig: config.audioPlayback,
      onAfterPlaying: this.onAfterPlaying,
      onBeforePlaying: this.onBeforePlaying,
      onStopPlaying: this.onStopPlaying,
      onPhoneme: this.onPhoneme,
    });

    const connection = new ConnectionService<InworldPacketT>({
      config,
      grpcAudioPlayer,
      webRtcLoopbackBiDiSession,
      name: this.scene,
      user: this.user,
      client: this.client,
      onError: this.onError,
      onReady: this.onReady,
      onMessage: this.onMessage,
      onHistoryChange: this.onHistoryChange,
      onDisconnect: this.onDisconnect,
      onInterruption: this.onInterruption,
      generateSessionToken: this.generateSessionToken,
      sessionContinuation: this.sessionContinuation,
      extension: this.extension,
    });

    return new InworldConnectionService<InworldPacketT>({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });
  }

  private buildConfiguration(): InternalClientConfiguration {
    const { connection = {}, capabilities = {}, ...restConfig } = this.config;
    const { gateway } = connection;

    return {
      ...restConfig,
      connection: {
        ...connection,
        gateway: this.ensureGateway(gateway),
      },
      capabilities: this.buildCapabilities(capabilities),
    };
  }

  private buildCapabilities(capabilities: Capabilities): CapabilitiesRequest {
    const {
      audio = true,
      emotions = false,
      interruptions = false,
      narratedActions = false,
      turnBasedStt = false,
      phonemes: phonemeInfo = false,
      silence: silenceEvents = false,
    } = capabilities;

    return {
      audio,
      emotions,
      interruptions,
      narratedActions,
      phonemeInfo,
      silenceEvents,
      text: true,
      triggers: true,
      turnBasedStt,
    };
  }

  private ensureGateway(gateway?: Gateway): Gateway {
    return {
      hostname: gateway?.hostname ?? GRPC_HOSTNAME,
      ssl: gateway?.ssl ?? true,
    };
  }

  private validate() {
    if (!this.scene) {
      throw Error('Scene name is required');
    }

    if (!SCENE_PATTERN.test(this.scene)) {
      throw Error('Scene name has wrong format');
    }

    const { audioPlayback } = this.config;

    if (audioPlayback?.stop) {
      if (!isNaturalNumber(audioPlayback.stop.duration)) {
        throw Error(
          'Stop duration for audio playback should be a natural number',
        );
      }

      if (!isNaturalNumber(audioPlayback.stop.ticks)) {
        throw Error('Stop ticks for audio playback should be a natural number');
      }
    }
  }
}
