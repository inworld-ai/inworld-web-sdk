/* eslint-disable */
import { AnimationClip } from 'three';
import { AnimationFile } from '../data/types';
import { Config } from '../../../../config';
import { GLTF, GLTFLoader } from 'three-stdlib';

export class AnimationLoader {
  animation: AnimationFile;
  animationClip?: AnimationClip;
  animationLoader: GLTFLoader;
  callback?: Function;
  isLoaded: Boolean = false;
  model?: GLTF;

  constructor(animation: AnimationFile) {
    this.animation = animation;
    this.animationLoader = new GLTFLoader();
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
  }

  public getClip(): AnimationClip | undefined {
    return this.animationClip;
  }

  public load(callback: Function) {
    this.callback = callback;
    this.animationLoader.load(
      Config.ANIMATIONS_URI + this.animation.file,
      this.onLoad,
      undefined,
      this.onError,
    );
  }

  private onError(error: ErrorEvent) {
    throw new Error(
      'Error loading animation file ' + this.animation.file + ' ' + error,
    );
  }

  private onLoad(model: GLTF) {
    if (model.animations.length != 1) {
      throw new Error(
        'Error loading animation file ' +
          this.animation.file +
          '. Single animation not found.',
      );
    }
    if (model.animations[0].name != this.animation.name) {
      throw new Error(
        'Error loading animation file ' +
          this.animation.file +
          '. Animation ' +
          this.animation.name +
          ' not found.',
      );
    }
    this.model = model;
    this.animationClip = model.animations[0];
    this.isLoaded = true;
    this.callback!(this.animation);
  }
}
