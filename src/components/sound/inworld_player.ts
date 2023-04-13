import { GrpcAudioPlayback } from './grpc_audio.playback';
import { Player } from './player';

const player = Player.getInstance();

export class InworldPlayer {
  private grpcAudioPlayer: GrpcAudioPlayback;

  constructor(props: { grpcAudioPlayer: GrpcAudioPlayback }) {
    this.grpcAudioPlayer = props.grpcAudioPlayer;
  }

  getMute() {
    return player.getMute();
  }

  mute(mute: boolean) {
    player.setMute(mute);
  }

  stop() {
    this.grpcAudioPlayer.stop();
  }

  clear() {
    this.grpcAudioPlayer.clearQueue();
  }

  playWorkaroundSound() {
    player.playWorkaroundSound();
  }

  isActive() {
    return this.grpcAudioPlayer.getIsActive();
  }

  hasPacket(props: { interactionId?: string; utteranceId?: string }) {
    return this.grpcAudioPlayer.hasPacketInQueue(props);
  }
}
