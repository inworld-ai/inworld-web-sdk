import {
  DataChunkDataType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  AudioSessionState,
  CancelResponsesProps,
  SendPacketParams,
  TtsPlaybackAction,
} from '../common/data_structures';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import { InworldPlayer } from '../components/sound/inworld_player';
import { InworldRecorder } from '../components/sound/inworld_recorder';
import { Character } from '../entities/character.entity';
import {
  InworldPacket,
  TriggerParameter,
} from '../entities/inworld_packet.entity';
import { ConnectionService } from './connection.service';
import { FeedbackService } from './feedback.service';

interface InworldConnectionServiceProps<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  connection: ConnectionService<InworldPacketT>;
  grpcAudioPlayer: GrpcAudioPlayback;
  grpcAudioRecorder: GrpcAudioRecorder;
  webRtcLoopbackBiDiSession: GrpcWebRtcLoopbackBiDiSession;
}

export class InworldConnectionService<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  readonly feedback: FeedbackService<InworldPacketT>;
  private connection: ConnectionService;
  private grpcAudioPlayer: GrpcAudioPlayback;

  player: InworldPlayer;
  recorder: InworldRecorder;

  constructor(props: InworldConnectionServiceProps<InworldPacketT>) {
    this.connection = props.connection;
    this.grpcAudioPlayer = props.grpcAudioPlayer;
    this.feedback = new FeedbackService(props.connection);

    this.player = new InworldPlayer({
      grpcAudioPlayer: this.grpcAudioPlayer,
    });
    this.recorder = new InworldRecorder({
      listener: async (base64AudioChunk: string) => {
        if (
          !this.connection.isActive() &&
          this.connection.isAutoReconnected() &&
          this.connection.getAudioSessionAction() !== AudioSessionState.START
        ) {
          await this.sendAudioSessionStart(
            this.connection.getAudioSessionParams(),
          );
        }

        this.sendAudio(
          base64AudioChunk,
          this.connection.getAudioSessionParams(),
        );
      },
      grpcAudioPlayer: this.grpcAudioPlayer,
      grpcAudioRecorder: props.grpcAudioRecorder,
      webRtcLoopbackBiDiSession: props.webRtcLoopbackBiDiSession,
    });
  }

  async getSessionState() {
    return this.connection.getSessionState();
  }

  async open() {
    return this.connection.openManually();
  }

  async close() {
    this.connection.close();
    this.recorder.stop();
    await this.player.stop();
    this.player.clear();
  }

  isActive() {
    return this.connection.isActive();
  }

  async getCharacters() {
    await this.connection.loadCharacters();

    return this.connection.getEventFactory().getCharacters();
  }

  async getCurrentCharacter() {
    return this.connection.getCurrentCharacter();
  }

  setCurrentCharacter(character: Character) {
    return this.connection.setCurrentCharacter(character);
  }

  getHistory() {
    return this.connection.getHistory();
  }

  clearHistory() {
    return this.connection.clearHistory();
  }

  getTranscript() {
    return this.connection.getTranscript();
  }

  async sendText(text: string, params?: SendPacketParams) {
    return this.connection.send(() =>
      this.connection.getEventFactory().text(text, params?.characters),
    );
  }

  async sendAudio(chunk: string, params?: SendPacketParams) {
    return this.connection.send(() =>
      this.connection
        .getEventFactory()
        .dataChunk(chunk, DataChunkDataType.AUDIO, params?.characters),
    );
  }

  async sendTrigger(
    name: string,
    parameters?: TriggerParameter[] | SendPacketParams,
  ) {
    if (parameters && Array.isArray(parameters)) {
      // TODO: Remove this deprecation warning in the next major release.
      console.warn(
        'Passing parameters as an array is deprecated. Please use an object instead.',
      );

      return this.connection.send(() =>
        this.connection.getEventFactory().trigger(name, {
          parameters,
        }),
      );
    } else if (!parameters || !Array.isArray(parameters)) {
      const characters =
        parameters && !Array.isArray(parameters)
          ? parameters.characters
          : undefined;

      return this.connection.send(() =>
        this.connection.getEventFactory().trigger(name, {
          ...parameters,
          characters,
        }),
      );
    }
  }

  async sendAudioSessionStart(params?: SendPacketParams) {
    if (this.connection.getAudioSessionAction() === AudioSessionState.START) {
      throw Error('Audio session is already started');
    }

    this.connection.setAudioSessionParams(params);
    this.connection.setAudioSessionAction(AudioSessionState.START);

    return this.connection.send(() =>
      this.connection.getEventFactory().audioSessionStart(params?.characters),
    );
  }

  async sendAudioSessionEnd(params?: SendPacketParams) {
    if (this.connection.getAudioSessionAction() !== AudioSessionState.START) {
      throw Error(
        'Audio session cannot be ended because it has not been started',
      );
    }

    this.connection.setAudioSessionParams();
    this.connection.setAudioSessionAction(AudioSessionState.END);

    return this.connection.send(() =>
      this.connection.getEventFactory().audioSessionEnd(params?.characters),
    );
  }

  async sendTTSPlaybackStart(params?: SendPacketParams) {
    return this.connection.send(() =>
      this.connection.getEventFactory().ttsPlaybackStart(params?.characters),
    );
  }

  async sendTTSPlaybackEnd(params?: SendPacketParams) {
    return this.connection.send(() =>
      this.connection.getEventFactory().ttsPlaybackEnd(params?.characters),
    );
  }

  async sendTTSPlaybackMute(isMuted: boolean, params?: SendPacketParams) {
    this.connection.setTtsPlaybackAction(
      isMuted ? TtsPlaybackAction.MUTE : TtsPlaybackAction.UNMUTE,
    );

    return this.connection.send(() =>
      this.connection
        .getEventFactory()
        .ttsPlaybackMute(isMuted, params?.characters),
    );
  }

  async sendCancelResponse(
    cancelResponses?: CancelResponsesProps,
    params?: SendPacketParams,
  ) {
    return this.connection.send(() =>
      this.connection
        .getEventFactory()
        .cancelResponse(cancelResponses, params?.characters),
    );
  }

  async sendNarratedAction(text: string, params?: SendPacketParams) {
    return this.connection.send(() =>
      this.connection
        .getEventFactory()
        .narratedAction(text, params?.characters),
    );
  }

  async sendCustomPacket(getPacket: () => ProtoPacket) {
    return this.connection.send(() => getPacket());
  }

  async interrupt() {
    return this.connection.interrupt();
  }

  baseProtoPacket(props?: {
    utteranceId?: boolean;
    interactionId?: boolean;
    characters?: Character[];
  }) {
    return this.connection.getEventFactory().baseProtoPacket(props);
  }
}
