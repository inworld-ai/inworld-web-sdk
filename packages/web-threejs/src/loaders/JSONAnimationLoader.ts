import { AnimationClip } from 'three';

import { IFileLoader } from './IFileLoader';

export interface JSONAnimationLoaderProps {
  fileURI: string;
}

export class JSONAnimationLoader implements IFileLoader {
  animationClip: AnimationClip;
  data: any;
  fileURI: string;

  constructor(props: JSONAnimationLoaderProps) {
    this.fileURI = props.fileURI;
  }

  async load(onLoad: Function, onError?: Function) {
    try {
      const file = await fetch(this.fileURI);
      this.data = await file.json();
      if (this.data[0].tracks.length > 0) {
        this.animationClip = AnimationClip.parse(this.data[0]);
      }
      onLoad(this.animationClip);
    } catch (e: unknown) {
      if (onError) {
        onError(e);
      } else {
        console.error(e);
      }
    }
  }
}
