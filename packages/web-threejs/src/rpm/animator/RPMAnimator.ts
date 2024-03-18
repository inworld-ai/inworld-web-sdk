import { AdditionalPhonemeInfo, EmotionBehaviorCode } from '@inworld/web-core';
import { AnimationMixer, LoopPingPong, Object3D, SkinnedMesh } from 'three';

import { GLTFAnimationLoader } from '../../loaders/GLTFAnimationLoader';
import { log } from '../../utils/Log';
import { RPMFacial } from './facial/RPMFacial';
import { RPMBehaviorToFacial } from './utils/RPMBehaviorToFacial';

export type RPMAnimatorProps = {
  animations: { [key: string]: GLTFAnimationLoader };
  animationsTalking: string[];
  defaultAnimation: string;
  defaultEmotion: EmotionBehaviorCode;
  model: Object3D;
};

const ANIMATION_FADE_TIME_S = 0.5;
const AVATAR_MESH_NAME = 'Armature';
const END_TALKING_DEBOUNCE_TIME_MS = 500;

export class RPMAnimator {
  animations: { [key: string]: GLTFAnimationLoader };
  animationMixer: AnimationMixer;
  animatorReady: boolean;
  facial: RPMFacial;
  idleTimeout: NodeJS.Timeout;
  lastClipName: string | null;
  modelMesh: SkinnedMesh;
  phonemeData: AdditionalPhonemeInfo[];
  props: RPMAnimatorProps;
  talkingCountDown: number;

  constructor(props: RPMAnimatorProps) {
    this.animatorReady = false;
    this.props = props;
    this.phonemeData = [];
    this.animations = props.animations;
    this.lastClipName = null;
    this.talkingCountDown = 0;
    this.playStill = this.playStill.bind(this);
    this.startIdleAnimation = this.startIdleAnimation.bind(this);
    this.startTalkingAnimation = this.startTalkingAnimation.bind(this);
    this.init();
  }

  init() {
    if (this.props.model) {
      this.props.model.traverse((child) => {
        if (child.type === 'Object3D' && child.name === AVATAR_MESH_NAME) {
          this.modelMesh = child as SkinnedMesh;
          this.modelMesh.traverse((subChild) => {
            log(subChild.name, subChild.type);
            if (
              subChild.name === 'Wolf3D_Head' &&
              subChild.type === 'SkinnedMesh'
            ) {
              this.facial = new RPMFacial({
                modelMesh: subChild as SkinnedMesh,
              });
              this.facial.setEmotion(
                RPMBehaviorToFacial[this.props.defaultEmotion],
              );
              this.animationMixer = new AnimationMixer(this.modelMesh);
              setTimeout(this.startIdleAnimation, END_TALKING_DEBOUNCE_TIME_MS);
              this.animatorReady = true;
              return;
            }
          });
        }
      });
      if (!this.modelMesh)
        throw new Error(
          'Error there was an error processing the model file in RPMAnimator',
        );
      if (!this.facial)
        throw new Error('Error Wolf3D_Head not found in RPMAnimator');
    } else {
      throw new Error('Error: Model not found');
    }
  }

  getTalkingClipName() {
    // At least 2 animations are needed to randomly choose one
    if (this.props.animationsTalking.length < 2) return '';
    return this.props.animationsTalking[
      Math.floor(Math.random() * (this.props.animationsTalking.length - 1))
    ];
  }

  playAnimation(animation: string) {
    if (this.animationMixer) {
      if (this.lastClipName) {
        this.animationMixer
          .clipAction(this.animations[this.lastClipName].animationClip)
          .fadeOut(ANIMATION_FADE_TIME_S);
      }
      this.animationMixer
        .clipAction(this.animations[animation].animationClip)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        .setLoop(LoopPingPong, 20)
        .play();
      this.lastClipName = animation;
    }
  }

  playStill(fadeInTime: number) {
    if (
      this.talkingCountDown > 0 ||
      this.lastClipName === this.props.defaultAnimation
    ) {
      return;
    }
    if (this.animationMixer) {
      if (this.lastClipName) {
        this.animationMixer
          .clipAction(this.animations[this.lastClipName].animationClip)
          .fadeOut(ANIMATION_FADE_TIME_S);
      }
      let clipName = this.props.defaultAnimation;
      if (this.animations[clipName].animationClip) {
        const durationSeconds =
          this.animations[clipName].animationClip.duration;
        this.animationMixer
          .clipAction(this.animations[clipName].animationClip)
          .reset()
          .fadeIn(fadeInTime)
          .play();
        this.lastClipName = clipName;
        this.idleTimeout = setTimeout(
          this.startIdleAnimation,
          durationSeconds * 1000,
        );
      }
    }
  }

  setEmotion(emotion: string) {
    if (this.animatorReady && emotion) {
      this.facial.setEmotion(emotion);
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (this.animatorReady && phonemes.length > 0) {
      this.phonemeData = phonemes;
      this.talkingCountDown += phonemes.length;
      this.facial.setPhonemes(phonemes);
      this.startTalkingAnimation();
    }
  }

  startIdleAnimation() {
    this.playStill(0.5);
  }

  startTalkingAnimation() {
    if (this.idleTimeout !== null) {
      clearTimeout(this.idleTimeout);
    }
    let clipName = '';
    while (!clipName || clipName === this.lastClipName) {
      clipName = this.getTalkingClipName();
    }

    if (this.animationMixer) {
      if (this.lastClipName) {
        this.animationMixer
          .clipAction(this.animations[this.lastClipName].animationClip)
          .fadeOut(ANIMATION_FADE_TIME_S);
      }
      this.animationMixer
        .clipAction(this.animations[clipName].animationClip)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        .setLoop(LoopPingPong, 20)
        .play();
      this.lastClipName = clipName;
    }
  }

  updateFrame(delta: number) {
    this.facial.updateFrame(delta);

    if (this.animationMixer instanceof AnimationMixer) {
      this.animationMixer.update(delta);
    }

    if (this.talkingCountDown > 0) {
      this.talkingCountDown -= 0.9999; // Not Integer to make sure the timing "count down < 0" can happen only once per sentence.
    }
    if (this.talkingCountDown < 0) {
      this.talkingCountDown = 0;
      this.facial.setEmotion(this.props.defaultEmotion);
      setTimeout(this.startIdleAnimation, END_TALKING_DEBOUNCE_TIME_MS);
    }
  }
}
