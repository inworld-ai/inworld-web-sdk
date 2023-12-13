import { MediaTrackConstraintsWithSuppress } from '../../common/data_structures';
import { GrpcAudioPlayback } from './grpc_audio.playback';
import { GrpcAudioRecorder } from './grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from './grpc_web_rtc_loopback_bidi.session';
import { Player } from './player';

export class InworldRecorder {
  private player = Player.getInstance();
  private isActive = true;
  private listener: (base64AudioChunk: string) => void;
  private grpcAudioPlayer: GrpcAudioPlayback;
  private grpcAudioRecorder: GrpcAudioRecorder;
  private webRtcLoopbackBiDiSession: GrpcWebRtcLoopbackBiDiSession;
  private recordingStream: MediaStream | undefined;

  constructor(props: {
    listener: (base64AudioChunk: string) => void;
    grpcAudioPlayer: GrpcAudioPlayback;
    grpcAudioRecorder: GrpcAudioRecorder;
    webRtcLoopbackBiDiSession: GrpcWebRtcLoopbackBiDiSession;
  }) {
    this.listener = props.listener;
    this.grpcAudioPlayer = props.grpcAudioPlayer;
    this.grpcAudioRecorder = props.grpcAudioRecorder;
    this.webRtcLoopbackBiDiSession = props.webRtcLoopbackBiDiSession;
  }

  async start() {
    const audio: MediaTrackConstraintsWithSuppress = {
      sampleRate: 16000,
      echoCancellation: { ideal: true },
      suppressLocalAudioPlayback: { ideal: true },
    };
    this.recordingStream = await navigator.mediaDevices.getUserMedia({
      audio,
      video: false,
    });

    await this.webRtcLoopbackBiDiSession.startSession(
      this.recordingStream,
      this.grpcAudioPlayer.getPlaybackStream(),
    );

    this.player.setStream(
      this.webRtcLoopbackBiDiSession.getPlaybackLoopbackStream(),
    );

    this.grpcAudioRecorder.startConvertion(
      this.webRtcLoopbackBiDiSession.getRecorderLoopBackStream(),
      (base64AudioChunk: string) => {
        if (this.getIsActive()) {
          this.listener(base64AudioChunk);
        }
      },
    );
  }

  setIsActive(isActive: boolean) {
    this.isActive = isActive;
  }

  getIsActive() {
    return this.isActive;
  }

  stop() {
    this.grpcAudioRecorder.stopConvertion();

    this.recordingStream?.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // Should be called AFTER any user interaction with the page.
  // Because of strict browser security policies.
  async initPlayback() {
    await this.grpcAudioPlayer.init();
    await this.webRtcLoopbackBiDiSession.startSession(
      new MediaStream(),
      this.grpcAudioPlayer.getPlaybackStream(),
    );

    this.player.setStream(
      this.webRtcLoopbackBiDiSession.getPlaybackLoopbackStream(),
    );
  }

  isRecording() {
    return this.grpcAudioRecorder.isRecording();
  }

  isSupported() {
    // https://github.com/inworld-ai/inworld/pull/3598
    return navigator.userAgent.indexOf('Firefox') === -1;
  }
}
