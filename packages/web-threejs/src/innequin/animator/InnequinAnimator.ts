import { AdditionalPhonemeInfo, EmotionBehaviorCode } from '@inworld/web-core';
import {
  AnimationClip,
  AnimationMixer,
  Clock,
  LoopOnce,
  Object3D,
  SkinnedMesh,
} from 'three';

import { FacialMaterialLoader } from '../../loaders/FacialMaterialLoader';
import {
  ANIMATION_TYPE,
  AnimationGesture,
  EMOTIONS_BODY,
} from '../../types/types';
import { log } from '../../utils/Log';
import { InnequinAnimationType } from '../InnequinConfiguration';
import { InnequinFacial } from './facial/InnequinFacial';
import { InnequinBehaviorToBody } from './utils/InnequinBehaviorToBody';
import { InnequinBehaviorToFacial } from './utils/InnequinBehaviorToFacial';

export type InnequinAnimatorProps = {
  animations: { [key: string]: InnequinAnimationType | null };
  animationClips: { [key: string]: AnimationClip | null };
  animationGestures: AnimationGesture[];
  defaultAnimation: string;
  defaultEmotion: EmotionBehaviorCode;
  facialMaterials: { [key: string]: FacialMaterialLoader | null };
  model: Object3D;
  modelMeshes: { [key: string]: SkinnedMesh | null };
};

const ANIMATION_FADE_TIME_S = 0.25;
const ANIMATION_GESTURE_DEBOUNCE_MIN_S = 1;
const ANIMATION_GESTURE_DEBOUNCE_MAX_S = 2;

export class InnequinAnimator {
  animations: { [key: string]: InnequinAnimationType };
  animationMixer: AnimationMixer;
  animationName: string;
  animatorReady: boolean;
  animationState: ANIMATION_TYPE;
  clock: Clock;
  emotion: EMOTIONS_BODY;
  emotionState: EMOTIONS_BODY;
  emotionStateOld: EMOTIONS_BODY;
  facial: InnequinFacial;
  gesture: string;
  gestureDebounce: number;
  gestureOld: string;
  isPlaying: Boolean;
  isReady: Boolean;
  isModelLoaded: Boolean;
  phonemeData: AdditionalPhonemeInfo[];
  props: InnequinAnimatorProps;
  talkingCurrentTime: number;

  constructor(props: InnequinAnimatorProps) {
    this.props = props;
    this.talkingCurrentTime = 0;
    this.gestureDebounce = 1;
    this.phonemeData = [];
    this.animations = props.animations;
    this.animationName = props.defaultAnimation;
    this.animationMixer = new AnimationMixer(props.model);
    this.animationState = ANIMATION_TYPE.HELLO;
    this.animatorReady = false;
    this.clock = new Clock();
    this.emotion = InnequinBehaviorToBody[props.defaultEmotion];
    this.emotionState = InnequinBehaviorToBody[props.defaultEmotion];
    this.emotionStateOld = InnequinBehaviorToBody[props.defaultEmotion];
    this.gesture = '';
    this.gestureOld = '';
    this.facial = new InnequinFacial({ ...this.props });
    this.isReady = false;
    this.isModelLoaded = false;

    this.onPlayGesture = this.onPlayGesture.bind(this);
    this.onPlayHello = this.onPlayHello.bind(this);
    this.onPlayIdle = this.onPlayIdle.bind(this);
    this.onPlayIntro = this.onPlayIntro.bind(this);
    this.onPlayOutro = this.onPlayOutro.bind(this);
    this.onReady = this.onReady.bind(this);

    this.init();
  }

  init() {
    this.facial.setEmotion(InnequinBehaviorToFacial[this.props.defaultEmotion]);
    this.animatorReady = true;
  }

  playAnimation(animation: string) {
    this.gesture = animation;
    this.updateGesture();
  }

  randomGesture(maxDuration: number) {
    const emotionGestures = this.props.animationGestures.filter(
      (gesture) =>
        gesture.emotion === this.emotionState &&
        gesture.duration < maxDuration - ANIMATION_FADE_TIME_S,
    );
    if (
      emotionGestures.length > 0 &&
      this.animationState === ANIMATION_TYPE.IDLE &&
      this.gestureDebounce === 0
    ) {
      let newGesturePass = false;
      let timeout = 3;
      while (!newGesturePass) {
        timeout--;
        if (timeout === 0) return; // To prevent a looping issue
        let newGesture =
          emotionGestures[Math.floor(Math.random() * emotionGestures.length)]
            .name;
        if (this.gestureOld !== newGesture) {
          newGesturePass = true;
          this.gesture = newGesture;
          this.updateGesture();
        }
      }
    } else {
      this.gesture = '';
    }
  }

  onPlayGesture() {
    log('Innequin - Playing Gesture:', this.gesture);
    if (
      this.isReady &&
      this.animationMixer &&
      this.animationState === ANIMATION_TYPE.IDLE
    ) {
      this.animationState = ANIMATION_TYPE.GESTURE;
      this.gestureDebounce = Math.floor(
        Math.random() *
          (ANIMATION_GESTURE_DEBOUNCE_MAX_S -
            ANIMATION_GESTURE_DEBOUNCE_MIN_S +
            1) +
          ANIMATION_GESTURE_DEBOUNCE_MIN_S,
      );
      this.animationMixer
        .clipAction(this.props.animationClips[this.animationName]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const animationKeys: string[] = Object.keys(this.animations);
      const newIndex = animationKeys.findIndex(
        (animation) => animation === this.gesture,
      );
      let action = this.animationMixer
        .clipAction(this.props.animationClips[animationKeys[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S);
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      const newEmotion = this.emotionStateOld !== this.emotionState;
      this.emotionStateOld = this.emotionState;
      this.animationName = animationKeys[newIndex];
      const emotionGesture = this.props.animationGestures.find(
        (animationGestures) => animationGestures.name === this.gesture,
      );
      if (newEmotion) {
        setTimeout(
          this.onPlayIntro,
          (emotionGesture?.duration! - ANIMATION_FADE_TIME_S) * 1000,
        );
      } else {
        setTimeout(
          this.onPlayIdle,
          (emotionGesture?.duration! - ANIMATION_FADE_TIME_S) * 1000,
        );
      }
    }
  }

  onPlayHello() {
    log('Innequin - Playing Hello', this.animationName);
    if (this.animationState === ANIMATION_TYPE.HELLO) {
      let action = this.animationMixer.clipAction(
        this.props.animationClips[this.animationName]!,
      );
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      setTimeout(
        this.onPlayIdle,
        (this.props.animationClips[this.animationName]!.duration -
          ANIMATION_FADE_TIME_S) *
          1000,
      );
      this.isPlaying = true;
    }
  }

  onPlayIdle() {
    log('Innequin - Playing Idle:', this.emotionState);
    if (
      this.isReady &&
      this.animationMixer &&
      this.animationState !== ANIMATION_TYPE.IDLE
    ) {
      this.animationState = ANIMATION_TYPE.IDLE;
      if (this.gestureDebounce === 0) {
        this.gestureDebounce = 1;
      }
      this.animationMixer
        .clipAction(this.props.animationClips[this.animationName]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const animationKeys: string[] = Object.keys(this.animations);
      const newIndex = animationKeys.findIndex(
        (animation) =>
          animation.toLowerCase().includes(this.emotionState.toLowerCase()) &&
          animation.toLowerCase().includes(ANIMATION_TYPE.IDLE),
      );
      this.animationMixer
        .clipAction(this.props.animationClips[animationKeys[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        .play();
      this.emotionStateOld = this.emotionState;
      this.animationName = animationKeys[newIndex];
    }
  }

  onPlayIntro() {
    if (
      this.isReady &&
      this.animationMixer &&
      this.animationState !== ANIMATION_TYPE.INTRO
    ) {
      log('Innequin - Playing Intro:', this.emotionState);
      this.animationState = ANIMATION_TYPE.INTRO;
      if (this.gestureDebounce === 0) {
        this.gestureDebounce = 1;
      }
      this.animationMixer
        .clipAction(this.props.animationClips[this.animationName]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const animationKeys: string[] = Object.keys(this.animations);
      const newIndex = animationKeys.findIndex(
        (animation) =>
          animation.toLowerCase().includes(this.emotionState.toLowerCase()) &&
          animation.toLowerCase().includes(ANIMATION_TYPE.INTRO),
      );
      const durTime =
        this.props.animationClips[animationKeys[newIndex]]!.duration;
      let action = this.animationMixer
        .clipAction(this.props.animationClips[animationKeys[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S);
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      this.emotionStateOld = this.emotionState;
      this.animationName = animationKeys[newIndex];
      setTimeout(
        this.onPlayIdle.bind(this),
        (durTime - ANIMATION_FADE_TIME_S) * 1000,
      );
    }
  }

  onPlayOutro() {
    if (
      this.isReady &&
      this.animationMixer &&
      this.animationState !== ANIMATION_TYPE.OUTRO
    ) {
      log('Innequin - Playing Outro:', this.emotionState);
      this.animationState = ANIMATION_TYPE.OUTRO;
      if (this.gestureDebounce === 0) {
        this.gestureDebounce = 1;
      }
      this.animationMixer
        .clipAction(this.props.animationClips[this.animationName]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const animationKeys: string[] = Object.keys(this.animations);
      const newIndex = animationKeys.findIndex(
        (animation) =>
          animation
            .toLowerCase()
            .includes(this.emotionStateOld.toLowerCase()) &&
          animation.toLowerCase().includes(ANIMATION_TYPE.OUTRO),
      );
      const durTime =
        this.props.animationClips[animationKeys[newIndex]]!.duration;
      let action = this.animationMixer
        .clipAction(this.props.animationClips[animationKeys[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S);
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      this.emotionStateOld = this.emotionState;
      this.animationName = animationKeys[newIndex];
      if (this.emotionState === EMOTIONS_BODY.NEUTRAL) {
        setTimeout(this.onPlayIdle, (durTime - ANIMATION_FADE_TIME_S) * 1000);
      } else {
        setTimeout(this.onPlayIntro, (durTime - ANIMATION_FADE_TIME_S) * 1000);
      }
    }
  }

  onReady() {
    log('InnequinAnimtaor - Ready');
    this.isReady = true;
    this.onPlayHello();
  }

  setEmotion(emotion: EmotionBehaviorCode) {
    if (this.animatorReady && emotion) {
      this.emotionState = InnequinBehaviorToBody[emotion];
      this.facial.setEmotion(InnequinBehaviorToFacial[emotion]);
      this.updateEmotion();
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (this.animatorReady && phonemes.length > 0) {
      this.phonemeData = phonemes;
      this.facial.setPhonemes(phonemes);
      this.talkingCurrentTime = 0;
      this.gesture = '';
    }
  }

  // Handle Body Intro/Outro Changes
  updateEmotion() {
    if (
      this.animatorReady &&
      this.emotionState &&
      this.emotionStateOld !== this.emotionState &&
      this.animationState === ANIMATION_TYPE.IDLE
    ) {
      if (this.emotionStateOld === EMOTIONS_BODY.NEUTRAL) {
        this.onPlayIntro();
      } else {
        this.onPlayOutro();
      }
    }
  }

  updateFrame(delta: number) {
    if (this.isReady) {
      if (this.animationMixer instanceof AnimationMixer) {
        this.animationMixer.update(this.clock.getDelta());
      }
      if (this.phonemeData.length > 0) {
        this.talkingCurrentTime += delta;
        if (
          this.gesture === '' &&
          this.animationState === ANIMATION_TYPE.IDLE &&
          this.talkingCurrentTime > ANIMATION_FADE_TIME_S &&
          this.talkingCurrentTime <
            this.phonemeData[this.phonemeData.length - 1].startOffsetS!
        ) {
          if (this.gestureDebounce === 0) {
            this.randomGesture(
              this.phonemeData[this.phonemeData.length - 1].startOffsetS! -
                this.talkingCurrentTime,
            );
          }
        } else if (
          this.talkingCurrentTime >
          this.phonemeData[this.phonemeData.length - 1].startOffsetS!
        ) {
          // Reset data if talking time is over the phoneme length
          this.phonemeData = [];
          this.talkingCurrentTime = 0;
          if (this.gestureDebounce > 0) {
            this.gestureDebounce--;
          }
        }
      }
      this.facial.updateFrame(delta);
    }
  }

  updateGesture() {
    if (
      this.animatorReady &&
      this.gesture !== '' &&
      this.gestureOld !== this.gesture &&
      this.animationState === ANIMATION_TYPE.IDLE
    ) {
      this.gestureOld = this.gesture;
      this.onPlayGesture();
    }
  }
}
