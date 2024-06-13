export class Player {
  private static instance: Player;

  static getInstance(): Player {
    if (!this.instance) {
      this.instance = new Player();
    }
    return Player.instance;
  }

  private audioElement: HTMLAudioElement;
  private mediaStream: MediaStream = new MediaStream();

  private constructor() {
    this.audioElement = document.createElement('audio');
    this.mediaStream = new MediaStream();
    document.body.append(this.audioElement);
  }

  getStream() {
    console.log('player: getStream');
    return this.mediaStream;
  }

  setStream(stream: MediaStream) {
    console.log('player: setStream');
    this.mediaStream = stream;
    this.audioElement.srcObject = stream;
    this.audioElement.autoplay = true;
    this.audioElement.play();
  }

  setTrack(track: MediaStreamTrack) {
    if (!this.audioElement.srcObject) {
      this.audioElement.srcObject = this.mediaStream;
    }
    this.mediaStream.addTrack(track);
    this.audioElement.autoplay = true;
  }

  // workaround sound for browsers with restrictive play policies;
  playWorkaroundSound() {
    this.audioElement.play();
  }
}
