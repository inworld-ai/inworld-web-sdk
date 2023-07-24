import { AnimationLoader } from './AnimationLoader';

export class AnimationsLoader {
  callback: Function;
  count: number = 0;
  total: number;
  startProgress: number;
  endProgress: number;
  updateProgress: Function;

  constructor(
    animationFiles: { [key: string]: AnimationLoader | null },
    callback: Function,
    startProgress: number,
    endProgress: number,
    updateProgress: Function,
  ) {
    this.callback = callback;
    this.onLoad = this.onLoad.bind(this);
    this.total = Object.keys(animationFiles).length || 0;
    this.startProgress = startProgress;
    this.endProgress = endProgress;
    this.updateProgress = updateProgress;
    for (let i in animationFiles) {
      this.count++;
      animationFiles[i]?.load(this.onLoad);
    }
  }

  public onLoad() {
    this.count--;
    const progress =
      Math.ceil(
        (this.endProgress - this.startProgress) *
          ((this.total - this.count) / this.total),
      ) + this.startProgress;
    this.updateProgress(progress);
    // console.log("AnimationsLoader: " + this.count);
    if (this.count == 0) {
      this.callback();
    }
  }
}
