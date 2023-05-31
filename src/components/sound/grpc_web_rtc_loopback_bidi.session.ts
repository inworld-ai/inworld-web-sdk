import { isIOSMobile } from '../../common/helpers';

export class GrpcWebRtcLoopbackBiDiSession {
  private static OFFER_OPTIONS = {
    offerVideo: false,
    offerAudio: true,
    offerToReceiveVideo: false,
    offerToReceiveAudio: true,
  };

  // this connection is receiving data (audiochunks) from server and pushes it to client
  // also consumes recording stream produced by client.
  private rtcServerConnection?: RTCPeerConnection;
  // this connection is receiving the active recordings from client and also giving data (audiochunks) from server to client.
  private rtcClientConnection?: RTCPeerConnection;
  private loopbackRecordStream?: MediaStream;
  private loopbackPlaybackStream?: MediaStream;

  async startSession(inputStream: MediaStream, outputStream: MediaStream) {
    // WebRtc Loopback doesn't work on iOS mobile.
    // FIXME: Need investigate the issue more thoroughly and find a "feature support" way
    // to detect WebRtc doesn't work.
    // https://developer.apple.com/forums/thread/698156
    if (isIOSMobile()) {
      this.loopbackRecordStream = inputStream;
      this.loopbackPlaybackStream = outputStream;
      return this;
    }

    let offer, answer;

    this.loopbackRecordStream = new MediaStream();
    this.loopbackPlaybackStream = new MediaStream();

    this.rtcServerConnection = new RTCPeerConnection();
    this.rtcClientConnection = new RTCPeerConnection();

    this.rtcServerConnection.onicecandidate = (e) => {
      e.candidate &&
        this.rtcClientConnection &&
        this.rtcClientConnection.addIceCandidate(
          new RTCIceCandidate(e.candidate),
        );
    };
    this.rtcClientConnection.onicecandidate = (e) => {
      e.candidate &&
        this.rtcServerConnection &&
        this.rtcServerConnection.addIceCandidate(
          new RTCIceCandidate(e.candidate),
        );
    };

    // setup the loopback

    this.rtcClientConnection.ontrack = (e) => {
      this.loopbackPlaybackStream?.addTrack(e.track);
    };

    this.rtcServerConnection.ontrack = (e) => {
      this.loopbackRecordStream?.addTrack(e.track);
    };

    inputStream.getTracks().forEach((track) => {
      this.rtcClientConnection?.addTrack(track);
    });

    outputStream.getTracks().forEach((track) => {
      this.rtcServerConnection?.addTrack(track);
    });

    offer = await this.rtcServerConnection.createOffer(
      GrpcWebRtcLoopbackBiDiSession.OFFER_OPTIONS,
    );

    await this.rtcServerConnection.setLocalDescription(offer);

    await this.rtcClientConnection.setRemoteDescription(offer);
    answer = await this.rtcClientConnection.createAnswer();
    await this.rtcClientConnection.setLocalDescription(answer);

    await this.rtcServerConnection.setRemoteDescription(answer);

    return this;
  }

  getRecorderLoopBackStream() {
    if (!this.loopbackRecordStream) {
      throw new Error('No loopbackRecordStream available');
    }
    return this.loopbackRecordStream;
  }

  getPlaybackLoopbackStream() {
    if (!this.loopbackPlaybackStream) {
      throw new Error('No loopbackPlaybackStream available');
    }
    return this.loopbackPlaybackStream;
  }
}
