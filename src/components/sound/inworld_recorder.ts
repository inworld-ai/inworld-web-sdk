import { isIOSMobile } from '../../common/helpers';
import { GrpcAudioPlayback } from './grpc_audio.playback';
import { GrpcAudioRecorder } from './grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from './grpc_web_rtc_loopback_bidi.session';
import { Player } from './player';

const player = Player.getInstance();

export class InworldRecorder {
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
    this.recordingStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        echoCancellation: { ideal: true },
        suppressLocalAudioPlayback: { ideal: true },
      },
      video: false,
    });

    await this.webRtcLoopbackBiDiSession.startSession(
      this.recordingStream,
      this.grpcAudioPlayer.getPlaybackStream(),
    );

    player.setStream(
      this.webRtcLoopbackBiDiSession.getPlaybackLoopbackStream(),
    );

    // WebRtc Loopback doesn't work on iOS mobile.
    // FIXME: Need investigate the issue more thoroughly and find a "feature support" way
    // to detect WebRtc doesn't work.
    const stream = isIOSMobile()
      ? this.recordingStream
      : this.webRtcLoopbackBiDiSession.getRecorderLoopBackStream();

    this.grpcAudioRecorder.startConvertion(
      stream,
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
  // https://developer.apple.com/forums/thread/698156
  async initPlayback() {
    await this.grpcAudioPlayer.init();
    await this.webRtcLoopbackBiDiSession.startSession(
      new MediaStream(),
      this.grpcAudioPlayer.getPlaybackStream(),
    );

    player.setStream(
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
