import { CapabilitiesRequest, UserRequest } from '../../proto/world-engine.pb';
import { GRPC_HOSTNAME } from '../common/constants';
import {
  Awaitable,
  Capabilities,
  Client,
  ClientConfiguration,
  Gateway,
  GenerateSessionTokenFn,
  InternalClientConfiguration,
  OnPhomeneFn,
  User,
  VoidFn,
} from '../common/interfaces';
import { HistoryItem } from '../components/history';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import { InworldPacket } from '../entities/inworld_packet.entity';
import { ConnectionService } from '../services/connection.service';
import { InworldConnectionService } from '../services/inworld_connection.service';

export class InworldClient {
  private user: UserRequest;
  private scene: string = '';
  private client: Client;
  private config: InternalClientConfiguration;

  private generateSessionToken: GenerateSessionTokenFn;

  private onDisconnect: VoidFn | undefined;
  private onError: ((err: Event | Error) => void) | undefined;
  private onMessage: ((message: InworldPacket) => Awaitable<void>) | undefined;
  private onReady: (() => Awaitable<void>) | undefined;
  private onHistoryChange:
    | ((history: HistoryItem[]) => Awaitable<void>)
    | undefined;
  private onPhoneme: OnPhomeneFn;

  private onAfterPlaying:
    | ((message: InworldPacket) => Awaitable<void>)
    | undefined;
  private onBeforePlaying:
    | ((message: InworldPacket) => Awaitable<void>)
    | undefined;
  private onStopPlaying: (() => Awaitable<void>) | undefined;

  constructor() {
    this.config = {
      capabilities: this.ensureCapabilities(),
    };
  }

  setUser(user: User) {
    this.user = {
      id: user.id,
      name: user.fullName,
    };

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
    const { connection = {}, capabilities = {} } = config;
    const { gateway } = connection;

    this.config = {
      ...config,
      connection: {
        ...connection,
        gateway: this.ensureGateway(GRPC_HOSTNAME, gateway),
      },
      capabilities: this.ensureCapabilities(capabilities),
    };

    return this;
  }

  setScene(name: string) {
    this.scene = name;

    return this;
  }

  setOnDisconnect(fn?: VoidFn) {
    this.onDisconnect = fn;

    return this;
  }

  setOnError(fn?: (err: Error) => void) {
    this.onError = fn;

    return this;
  }

  setOnMessage(fn?: (message: InworldPacket) => Awaitable<void>) {
    this.onMessage = fn;

    return this;
  }

  setOnReady(fn?: () => Awaitable<void>) {
    this.onReady = fn;

    return this;
  }

  setOnHistoryChange(fn?: (history: HistoryItem[]) => Awaitable<void>) {
    this.onHistoryChange = fn;

    return this;
  }

  setOnPhoneme(fn?: OnPhomeneFn) {
    this.onPhoneme = fn;

    return this;
  }

  setOnAfterPlaying(fn?: (message: InworldPacket) => Awaitable<void>) {
    this.onAfterPlaying = fn;

    return this;
  }

  setOnBeforePlaying(fn?: (message: InworldPacket) => Awaitable<void>) {
    this.onBeforePlaying = fn;

    return this;
  }

  setOnStopPlaying(fn?: () => Awaitable<void>) {
    this.onStopPlaying = fn;

    return this;
  }

  build() {
    this.validate();

    const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();
    const grpcAudioRecorder = new GrpcAudioRecorder();
    const grpcAudioPlayer = new GrpcAudioPlayback({
      onAfterPlaying: this.onAfterPlaying,
      onBeforePlaying: this.onBeforePlaying,
      onStopPlaying: this.onStopPlaying,
      onPhoneme: this.onPhoneme,
    });

    const connection = new ConnectionService({
      grpcAudioPlayer,
      webRtcLoopbackBiDiSession,
      name: this.scene,
      user: this.user,
      client: this.client,
      config: this.config,
      onError: this.onError,
      onReady: this.onReady,
      onMessage: this.onMessage,
      onHistoryChange: this.onHistoryChange,
      onDisconnect: this.onDisconnect,
      generateSessionToken: this.generateSessionToken,
    });

    return new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });
  }

  private ensureCapabilities(capabilities?: Capabilities): CapabilitiesRequest {
    return {
      audio: capabilities?.audio ?? true,
      emotions: capabilities?.emotions ?? false,
      interruptions: capabilities?.interruptions ?? false,
      narratedActions: capabilities?.narratedActions ?? false,
      phonemeInfo: capabilities?.phonemes ?? false,
      silenceEvents: capabilities?.silence ?? false,
      text: true,
      triggers: true,
      turnBasedStt: capabilities?.turnBasedStt ?? false,
    };
  }

  private ensureGateway(hostname: string, gateway?: Gateway): Gateway {
    return {
      hostname: gateway?.hostname ?? hostname,
      ssl: gateway?.ssl ?? true,
    };
  }

  private validate() {
    if (!this.scene) {
      throw Error('Scene name is required');
    }
  }
}
