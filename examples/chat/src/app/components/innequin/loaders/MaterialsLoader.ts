import { FaceMaterialLoader } from './FaceMaterialLoader';

export class MaterialsLoader {
  callback: Function;
  count: number = 0;
  total: number;
  startProgress: number;
  endProgress: number;
  updateProgress: Function;

  constructor(
    materialFiles: { [key: string]: FaceMaterialLoader | null },
    callback: Function,
    startProgress: number,
    endProgress: number,
    updateProgress: Function,
  ) {
    this.callback = callback;
    this.onLoad = this.onLoad.bind(this);
    this.total = Object.keys(materialFiles).length || 0;
    this.startProgress = startProgress;
    this.endProgress = endProgress;
    this.updateProgress = updateProgress;
    for (let i in materialFiles) {
      this.count++;
      materialFiles[i]?.load(this.onLoad);
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
    // console.log("MaterialsLoader: " + this.count);
    if (this.count == 0) {
      this.callback();
    }
  }
}
