import {
  DataChunkDataType,
  InworldPacket as ProtoPacket,
} from '../../proto/packets.pb';
import {
  AudioSessionState,
  CancelResponsesProps,
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
  private connection: ConnectionService;
  private grpcAudioPlayer: GrpcAudioPlayback;

  player: InworldPlayer;
  recorder: InworldRecorder;

  constructor(props: InworldConnectionServiceProps<InworldPacketT>) {
    this.connection = props.connection;
    this.grpcAudioPlayer = props.grpcAudioPlayer;

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
          await this.sendAudioSessionStart();
        }

        this.sendAudio(base64AudioChunk);
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

  close() {
    this.connection.close();
  }

  isActive() {
    return this.connection.isActive();
  }

  async getCharacters() {
    return this.connection.getCharactersList();
  }

  async getCurrentCharacter() {
    await this.connection.getCharactersList();

    return this.connection.getEventFactory().getCurrentCharacter();
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

  setCurrentCharacter(character: Character) {
    return this.connection.getEventFactory().setCurrentCharacter(character);
  }

  async sendText(text: string) {
    return this.connection.send(() =>
      this.connection.getEventFactory().text(text),
    );
  }

  async sendAudio(chunk: string) {
    return this.connection.send(() =>
      this.connection
        .getEventFactory()
        .dataChunk(chunk, DataChunkDataType.AUDIO),
    );
  }

  async sendTrigger(name: string, parameters?: TriggerParameter[]) {
    return this.connection.send(() =>
      this.connection.getEventFactory().trigger(name, parameters),
    );
  }

  async sendAudioSessionStart() {
    if (this.connection.getAudioSessionAction() === AudioSessionState.START) {
      throw Error('Audio session is already started');
    }

    this.connection.setAudioSessionAction(AudioSessionState.START);

    return this.connection.send(() =>
      this.connection.getEventFactory().audioSessionStart(),
    );
  }

  async sendAudioSessionEnd() {
    if (this.connection.getAudioSessionAction() !== AudioSessionState.START) {
      throw Error(
        'Audio session cannot be ended because it has not been started',
      );
    }

    this.connection.setAudioSessionAction(AudioSessionState.END);

    return this.connection.send(() =>
      this.connection.getEventFactory().audioSessionEnd(),
    );
  }

  async sendTTSPlaybackStart() {
    return this.connection.send(() =>
      this.connection.getEventFactory().ttsPlaybackStart(),
    );
  }

  async sendTTSPlaybackEnd() {
    return this.connection.send(() =>
      this.connection.getEventFactory().ttsPlaybackEnd(),
    );
  }

  async sendTTSPlaybackMute(isMuted: boolean) {
    return this.connection.send(() =>
      this.connection.getEventFactory().ttsPlaybackMute(isMuted),
    );
  }

  async sendCancelResponse(cancelResponses?: CancelResponsesProps) {
    return this.connection.send(() =>
      this.connection.getEventFactory().cancelResponse(cancelResponses),
    );
  }

  async sendCustomPacket(getPacket: () => ProtoPacket) {
    return this.connection.send(() => getPacket());
  }

  async interrupt() {
    return this.connection.interrupt();
  }

  baseProtoPacket(props?: { utteranceId?: boolean; interactionId?: boolean }) {
    return this.connection.getEventFactory().baseProtoPacket(props);
  }
}
