import { AdditionalPhonemeInfo, EmotionBehaviorCode } from '@inworld/web-core';
import { Object3D, Object3DEventMap } from 'three';
import { GLTF } from 'three-stdlib';

import { BatchFileLoader } from '../loaders/BatchFileLoader';
import { GLTFModelLoader } from '../loaders/GLTFModelLoader';
import { JSONAnimationLoader } from '../loaders/JSONAnimationLoader';
import { JSONFileLoader } from '../loaders/JSONFileLoader';
import { ANIMATION_TYPE } from '../types/types';
import { RPMAnimator } from './animator/RPMAnimator';
import { RPMBehaviorToFacial } from './animator/utils/RPMBehaviorToFacial';
import { AnimationType, RPMConfiguration } from './RPMConfiguration';

export type RPMProps = {
  baseURI: string;
  configURI: string;
  dracoURI: string;
  onLoad: Function;
  onProgress: Function;
};

export class RPM {
  animationLoaders: { [key: string]: JSONAnimationLoader };
  animationsTalking: string[];
  animator: RPMAnimator | null;
  baseURI: string;
  config: RPMConfiguration | null;
  configFile: JSONFileLoader;
  configURI: string;
  dracoURI: string;
  modelFile: GLTFModelLoader | null;
  onLoad: Function;
  onProgress: Function;

  constructor(props: RPMProps) {
    this.animationLoaders = {};
    this.animationsTalking = [];
    this.baseURI = props.baseURI;
    this.configURI = props.configURI;
    this.dracoURI = props.dracoURI;
    this.onLoad = props.onLoad;
    this.onProgress = props.onProgress;
    this.onLoadAnimations = this.onLoadAnimations.bind(this);
    this.onLoadComplete = this.onLoadComplete.bind(this);
    this.onLoadConfig = this.onLoadConfig.bind(this);
    this.onLoadProgress = this.onLoadProgress.bind(this);
    this.onLoadModel = this.onLoadModel.bind(this);
    this.init();
  }

  init() {
    console.log('RPM - Loading Character');
    this.loadConfig();
  }

  getGLTF(): GLTF {
    if (this.modelFile && this.modelFile.getGLTF()) {
      return this.modelFile.getGLTF();
    }
  }

  getModel(): Object3D<Object3DEventMap> {
    return this.getGLTF().scene.getObjectByName('Armature');
  }

  getScene() {
    return this.getGLTF().scene;
  }

  loadAnimations() {
    for (const animationName in this.config.rpm.animations) {
      const animation: AnimationType =
        this.config.rpm.animations[animationName];
      if (animation.type === ANIMATION_TYPE.TALKING) {
        this.animationsTalking.push(animationName);
      }
      const fileURI: string =
        this.baseURI +
        this.config.rpm.baseURIs.ANIMATIONS_JSON +
        animation.file;
      this.animationLoaders[animationName] = new JSONAnimationLoader({
        fileURI: fileURI,
      });
    }
    const batchLoader = new BatchFileLoader({
      fileLoaders: this.animationLoaders,
      callback: this.onLoadAnimations,
      startProgress: 33,
      endProgress: 66,
      updateProgress: this.onLoadProgress,
    });
    batchLoader;
  }

  // Loads the config.json file with the animations, assets and skins character data as well as the global paths to asset files.
  loadConfig() {
    this.configFile = new JSONFileLoader({ fileURI: this.configURI });
    this.configFile.load(this.onLoadConfig);
  }

  loadModel() {
    const fileURI: string =
      this.baseURI +
      this.config.rpm.baseURIs.MODELS_BODY +
      this.config.rpm.defaults.MODEL;
    this.modelFile = new GLTFModelLoader({ path: fileURI });
    this.modelFile.load(this.onLoadModel);
  }

  onLoadAnimations() {
    console.log('RPM - Animations Loaded.');
    this.animator = new RPMAnimator({
      animations: this.animationLoaders,
      animationsTalking: this.animationsTalking,
      defaultAnimation: this.config.rpm.defaults.IDLE_ANIMATION,
      defaultEmotion: this.config.rpm.defaults.EMOTION,
      model: this.getScene(),
    });
    this.onLoadComplete();
  }

  onLoadComplete() {
    this.onLoad(this.config);
    console.log('RPM - Character Loaded.');
  }

  onLoadConfig(config: RPMConfiguration) {
    console.log('RPM - Config Loaded.');
    this.config = config;
    this.configFile = null;
    this.loadModel();
  }

  onLoadModel() {
    console.log('RPM - Model Loaded.');
    this.loadAnimations();
  }

  onLoadProgress(progress: number) {
    // console.log('onLoadProgress', progress);
    this.onProgress(progress);
  }

  setEmotion(event: EmotionBehaviorCode) {
    if (this.animator) {
      this.animator.setEmotion(RPMBehaviorToFacial[event]);
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (this.animator) {
      this.animator.setPhonemes(phonemes);
    }
  }

  updateFrame(delta: number) {
    if (this.animator && this.animator.animatorReady) {
      this.animator.updateFrame(delta);
    }
  }
}
