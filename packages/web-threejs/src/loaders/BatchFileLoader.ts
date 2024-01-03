import { IFileLoader } from './IFileLoader';

export interface BatchFileLoaderProps {
  fileLoaders: { [key: string]: IFileLoader | null };
  callback: Function;
  startProgress: number;
  endProgress: number;
  updateProgress: Function;
}

export class BatchFileLoader {
  callback: Function;
  count: number = 0;
  total: number;
  startProgress: number;
  endProgress: number;
  updateProgress: Function;

  constructor(props: BatchFileLoaderProps) {
    this.callback = props.callback;
    this.onLoad = this.onLoad.bind(this);
    this.total = Object.keys(props.fileLoaders).length || 0;
    this.startProgress = props.startProgress;
    this.endProgress = props.endProgress;
    this.updateProgress = props.updateProgress;
    for (let i in props.fileLoaders) {
      this.count++;
      props.fileLoaders[i]?.load(this.onLoad);
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
    if (this.count <= 0) {
      this.callback();
    }
  }
}
