import { InworldPacket } from '../../entities/packets/inworld_packet.entity';
import { GrpcAudioPlayback } from './grpc_audio.playback';
import { Player } from './player';

export class InworldPlayer<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private player = Player.getInstance();
  private grpcAudioPlayer: GrpcAudioPlayback<InworldPacketT>;

  constructor(props: { grpcAudioPlayer: GrpcAudioPlayback<InworldPacketT> }) {
    this.grpcAudioPlayer = props.grpcAudioPlayer;
  }

  getMute() {
    return this.grpcAudioPlayer.getMute();
  }

  mute(mute: boolean) {
    this.grpcAudioPlayer.mute(mute);
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
