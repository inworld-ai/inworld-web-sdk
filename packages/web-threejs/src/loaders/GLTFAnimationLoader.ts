/* eslint-disable */
import { AnimationClip } from 'three';
import { GLTF, GLTFLoader } from 'three-stdlib';

import { IFileLoader } from './IFileLoader';

export interface GLTFAnimationLoaderProps {
  name: string;
  fileURI: string;
}

export class GLTFAnimationLoader implements IFileLoader {
  animationClip?: AnimationClip;
  animationLoader: GLTFLoader;
  name: string;
  callback?: Function;
  fileURI: string;
  isLoaded: Boolean = false;
  model?: GLTF;

  constructor(props: GLTFAnimationLoaderProps) {
    this.name = props.name;
    this.fileURI = props.fileURI;
    this.animationLoader = new GLTFLoader();
    this.onLoad = this.onLoad.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onError = this.onError.bind(this);
  }

  public getClip(): AnimationClip | undefined {
    return this.animationClip;
  }

  public load(callback: Function) {
    this.callback = callback;
    this.animationLoader.load(
      this.fileURI,
      this.onLoad,
      undefined,
      this.onError,
    );
  }

  private onError(error: ErrorEvent) {
    throw new Error(
      'Error loading animation file ' + this.fileURI + ' ' + error,
    );
  }

  private onLoad(model: GLTF) {
    if (model.animations.length !== 1) {
      throw new Error(
        'Error loading animation file ' +
          this.fileURI +
          '. Single animation not found.',
      );
    }
    if (model.animations[0].name !== this.name) {
      throw new Error(
        'Error loading animation file ' +
          this.fileURI +
          '. Animation ' +
          this.name +
          ' not found.',
      );
    }
    this.model = model;
    this.animationClip = model.animations[0];
    this.isLoaded = true;
    this.callback!();
  }

  private onUpdate(event: ProgressEvent) {
    // console.log('GLTFModelLoader onUpdate', event);
  }
}
