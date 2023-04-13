import { DataChunkDataType } from '../../proto/packets.pb';
import { AudioSessionAction, CancelResponsesProps } from '../common/interfaces';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import { InworldPlayer } from '../components/sound/inworld_player';
import { InworldRecorder } from '../components/sound/inworld_recorder';
import { Character } from '../entities/character.entity';
import { ConnectionService } from './connection.service';

interface InworldConnectionServiceProps {
  connection: ConnectionService;
  grpcAudioPlayer: GrpcAudioPlayback;
  grpcAudioRecorder: GrpcAudioRecorder;
  webRtcLoopbackBiDiSession: GrpcWebRtcLoopbackBiDiSession;
}

export class InworldConnectionService {
  private connection: ConnectionService;
  private grpcAudioPlayer: GrpcAudioPlayback;

  player: InworldPlayer;
  recorder: InworldRecorder;

  constructor(props: InworldConnectionServiceProps) {
    this.connection = props.connection;
    this.grpcAudioPlayer = props.grpcAudioPlayer;

    this.player = new InworldPlayer({
      grpcAudioPlayer: this.grpcAudioPlayer,
    });
    this.recorder = new InworldRecorder({
      listener: async (base64AudioChunk: string) => {
        if (!this.connection.isActive()) {
          await this.sendAudioSessionStart();
        }

        this.sendAudio(base64AudioChunk);
      },
      grpcAudioPlayer: this.grpcAudioPlayer,
      grpcAudioRecorder: props.grpcAudioRecorder,
      webRtcLoopbackBiDiSession: props.webRtcLoopbackBiDiSession,
    });
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

  async sendTrigger(name: string) {
    return this.connection.send(() =>
      this.connection.getEventFactory().trigger(name),
    );
  }

  async sendAudioSessionStart() {
    if (this.connection.getAudioSessionAction() === AudioSessionAction.START) {
      throw Error('Audio session is already started');
    }

    this.connection.setAudioSessionAction(AudioSessionAction.START);

    return this.connection.send(() =>
      this.connection.getEventFactory().audioSessionStart(),
    );
  }

  async sendAudioSessionEnd() {
    if (this.connection.getAudioSessionAction() !== AudioSessionAction.START) {
      throw Error(
        'Audio session cannot be ended because it has not been started',
      );
    }

    this.connection.setAudioSessionAction(AudioSessionAction.END);

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

  async sendCancelResponse(cancelResponses?: CancelResponsesProps) {
    return this.connection.send(() =>
      this.connection.getEventFactory().cancelResponse(cancelResponses),
    );
  }
}
