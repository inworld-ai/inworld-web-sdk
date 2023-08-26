import { GrpcAudioPlayback } from './grpc_audio.playback';
import { Player } from './player';

export class InworldPlayer {
  private player = Player.getInstance();
  private grpcAudioPlayer: GrpcAudioPlayback;

  constructor(props: { grpcAudioPlayer: GrpcAudioPlayback }) {
    this.grpcAudioPlayer = props.grpcAudioPlayer;
  }

  getMute() {
    return this.player.getMute();
  }

  mute(mute: boolean) {
    this.player.setMute(mute);
  }

  async stop() {
    return this.grpcAudioPlayer.stop();
  }

  clear() {
    this.grpcAudioPlayer.clearQueue();
  }

  playWorkaroundSound() {
    this.player.playWorkaroundSound();
  }

  isActive() {
    return this.grpcAudioPlayer.getIsActive();
  }

  hasPacket(props: { interactionId?: string; utteranceId?: string }) {
    return this.grpcAudioPlayer.hasPacketInQueue(props);
  }
}
