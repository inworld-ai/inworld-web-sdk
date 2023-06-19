import { 
  AnimationClip, 
  AnimationMixer, 
  Clock, 
  LoopOnce,
  Object3D, 
  SkinnedMesh} from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useCallback, useState } from "react";
import { MaterialLoader } from "../loaders/MaterialLoader";
import { ANIMATION_TYPE, EMOTIONS, EMOTIONS_FACE, AnimationGesture } from '../../../types';
import { Facial } from "./facial/Facial";
import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-sdk';
import {BehaviorToBody} from './BehaviorToBody';

interface AnimatorProps {
  animationClips: { [key: string]: AnimationClip | null; };
  animationGestures: AnimationGesture[];
  animationSequence: string[];
  emotion: EMOTIONS;
  emotionEvent?: EmotionEvent;
  emotionFace: EMOTIONS_FACE;
  facialMaterials: { [key: string]: MaterialLoader | null; };
  facialMeshes: { [key: string]: SkinnedMesh | null; };
  isReady: Boolean;
  isModelLoaded: Boolean;
  model: Object3D;
  phonemes: AdditionalPhonemeInfo[];
  setIsPlaying: Function;
}

const ANIMATION_FADE_TIME_S = 0.25;
const ANIMATION_GESTURE_DEBOUNCE_MIN_S = 1;
const ANIMATION_GESTURE_DEBOUNCE_MAX_S = 2;

let emotion: EMOTIONS = EMOTIONS.NEUTRAL;

// Those variables needed for immediate realtime animation playback.
// won't work with any sort of react useState as it is not immediate / realtime.
let talkingCurrentTime = 0;
let gestureDebounce = 1;
let phonemeData: AdditionalPhonemeInfo[] = [];

export function Animator(props: AnimatorProps) {

  const animationIndexRef = useRef(0);
  const [animationMixer, setAnimationMixer] = useState<AnimationMixer | null>(null);
  const animationState = useRef(ANIMATION_TYPE.HELLO);
  const [animatorReady, setAnimatorReady] = useState(false);
  const clockRef = useRef(new Clock());

  // const emotionRef = useRef(emotion);
  // const emotionOldRef = useRef(emotion);

  const [emotionState, setEmotionState] = useState(EMOTIONS.NEUTRAL);
  const [emotionStateOld, setEmotionStateOld] = useState(EMOTIONS.NEUTRAL);


  const emotionToChangeRef = useRef(emotion);
  const [gesture, setGesture] = useState("");
  const gestureOldRef = useRef("");

  // Create the AnimationMixer
  useEffect(() => {
    if (props.isReady && props.model && props.isModelLoaded) {
      setAnimationMixer(new AnimationMixer(props.model));
    }
  }, [props.isReady, props.model, props.isModelLoaded]);

  // Set Animator Ready
  useEffect(() => {
    if (props.isReady && animationMixer) {
      console.log('Animator Ready');
      setAnimatorReady(true);
    }
  }, [props.isReady, animationMixer]);

  // Play Hello Animation
  useEffect(() => {
    if (animatorReady && animationMixer && props.animationClips && /*emotionRef.current*/emotionState && animationState.current == ANIMATION_TYPE.HELLO) {
      console.log('Play Hello Animation');
      // animationState.current = ANIMATION_TYPE.HELLO;
      let action = animationMixer
      .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!);
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      setTimeout(() => playIdle(), (props.animationClips[props.animationSequence[animationIndexRef.current]]!.duration - ANIMATION_FADE_TIME_S) * 1000);
      props.setIsPlaying(true);
    }
  }, [animatorReady, props.animationClips, animationMixer, emotionState]);//emotionRef.current]);

  // Handle Body Intro/Outro Changes
  useEffect(() => {
    // console.log('Handle Body Intro/Outro Changes', emotionOldRef.current, emotionRef.current);
    console.log('Handle Body Intro/Outro Changes', emotionStateOld, emotionState);
    // if (animatorReady && emotionRef.current && emotionOldRef.current != emotionRef.current) {
    if (animatorReady && emotionState && emotionStateOld != emotionState && animationState.current == ANIMATION_TYPE.IDLE) {
      if (emotionStateOld == EMOTIONS.NEUTRAL ) {
        playIntro();
      } else {
        playOutro();
      }
    }
  }, [animatorReady, emotionState, emotionStateOld, animationState.current]);

  const playIdle = () => {
    if (props.isReady && animationMixer && animationState.current != ANIMATION_TYPE.IDLE) {
      console.log('Play Idle');
      animationState.current = ANIMATION_TYPE.IDLE;
      if (gestureDebounce == 0) {
        gestureDebounce = 1;
      }
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(emotionState) && animation.toLowerCase().includes(ANIMATION_TYPE.IDLE));
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        .play();
      setEmotionStateOld(emotionState);
      animationIndexRef.current = newIndex;
    }
  }

  const playIntro = () => {
    if (props.isReady && animationMixer && animationState.current != ANIMATION_TYPE.INTRO) {
      console.log('Play Intro');
      animationState.current = ANIMATION_TYPE.INTRO;
      if (gestureDebounce == 0) {
        gestureDebounce = 1;
      }
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(emotionState) && animation.toLowerCase().includes(ANIMATION_TYPE.INTRO));
      const durTime = props.animationClips[props.animationSequence[newIndex]]!.duration;
      let action = animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      setEmotionStateOld(emotionState);
      animationIndexRef.current = newIndex;
      setTimeout(() => playIdle(), (durTime - ANIMATION_FADE_TIME_S) * 1000);
    }
  }

  const playOutro = () => {
    if (props.isReady && animationMixer && animationState.current != ANIMATION_TYPE.OUTRO) {
      console.log('Play Outro');
      animationState.current = ANIMATION_TYPE.OUTRO;
      if (gestureDebounce == 0) {
        gestureDebounce = 1;
      }
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( 
        animation => animation.toLowerCase().includes(emotionStateOld) && animation.toLowerCase().includes(ANIMATION_TYPE.OUTRO));
      const durTime = props.animationClips[props.animationSequence[newIndex]]!.duration;
      let action = animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      setEmotionStateOld(emotionState);
      animationIndexRef.current = newIndex;
      if (emotionState == EMOTIONS.NEUTRAL) {
        setTimeout(playIdle, (durTime - ANIMATION_FADE_TIME_S) * 1000);
      } else {
        setTimeout(playIntro, (durTime - ANIMATION_FADE_TIME_S) * 1000);
      }
    }
  }

  const playGesture = () => {
    if (props.isReady && animationMixer && animationState.current == ANIMATION_TYPE.IDLE) {
      console.log('Play Gesture');
      animationState.current = ANIMATION_TYPE.GESTURE;
      gestureDebounce = Math.floor(Math.random() * (ANIMATION_GESTURE_DEBOUNCE_MAX_S - ANIMATION_GESTURE_DEBOUNCE_MIN_S + 1) + ANIMATION_GESTURE_DEBOUNCE_MIN_S);
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( animation => animation == gesture);
      let action = animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      // console.log('Play Gesture Emotion State:', emotionOldRef.current, emotionRef.current);
      console.log('Play Gesture Emotion State:', emotionStateOld, emotionState);
      const newEmotion = emotionStateOld != emotionState;
      setEmotionStateOld(emotionState);
      animationIndexRef.current = newIndex;
      const emotionGesture = props.animationGestures.find(animationGestures => animationGestures.name == gesture);
      if (newEmotion) {
        setTimeout(playIntro, (emotionGesture?.duration! - ANIMATION_FADE_TIME_S) * 1000);
      } else {
        setTimeout(playIdle, (emotionGesture?.duration! - ANIMATION_FADE_TIME_S) * 1000);
      }
    }
  }

  useFrame((state, delta) => {
    if (props.isReady) {
      if (animationMixer instanceof AnimationMixer) {
        animationMixer.update(clockRef.current.getDelta());
        // This is needed due to a bug in Three.js around combining a GLB model and GLB animation file that both have a 90* offset.
        props.model.rotation.set(0, 0, 0); 
      }
  
      if ( 
        phonemeData.length > 0
        ) {
          talkingCurrentTime += delta;
          if (gesture == "" && 
            animationState.current == ANIMATION_TYPE.IDLE && 
            talkingCurrentTime > ANIMATION_FADE_TIME_S &&
            talkingCurrentTime < phonemeData[phonemeData.length - 1].startOffsetS!) {
            if (gestureDebounce == 0) {
              randomGesture(phonemeData[phonemeData.length - 1].startOffsetS! - talkingCurrentTime);
            }
          } else if(talkingCurrentTime > phonemeData[phonemeData.length - 1].startOffsetS!) {
            // Reset data if talking time is over the phoneme length
            phonemeData = [];
            talkingCurrentTime = 0;
            if (gestureDebounce > 0) {
              gestureDebounce--;
            }
          }
      }
    }

  });

  // Handles storing the phonomes
  useEffect(() => {
    if (animatorReady && props.phonemes.length > 0) {
      // console.log("Set Phonemes");
      phonemeData = props.phonemes;
      talkingCurrentTime = 0;
      setGesture("");
    }
  }, [animatorReady, props.phonemes]);

  // Handles change in emotion
  useEffect(() => {
    if (animatorReady && props.emotionEvent) {
      // console.log('Emotion To Change');
      setEmotionState(BehaviorToBody[props.emotionEvent.behavior.code]);
      // gestureDebounceRef.current++;
    }
  }, [animatorReady, props.emotionEvent]);

  // Handles change in emotion. We use this to sync the face with the body if emotion changes mid sentence
  // useEffect(() => {
  //   if (animatorReady && props.emotionEvent) {
  //     emotionToChangeRef.current = BehaviorToBody[props.emotionEvent.behavior.code];
  //   }
  // }, [animatorReady, props.emotionEvent]);

  // useEffect(() => {
  //   if (animatorReady && emotionToChangeRef.current) {
  //     emotionRef.current = emotionToChangeRef.current;
  //   }
  // }, [animatorReady, emotionToChangeRef.current]);

  // Handles choosing a random gesture
  const randomGesture = useCallback((maxDuration: number) => {
    const emotionGestures = props.animationGestures.filter(gesture => gesture.emotion == emotionState && gesture.duration < maxDuration - ANIMATION_FADE_TIME_S);
    if (emotionGestures.length > 0 && animationState.current == ANIMATION_TYPE.IDLE && gestureDebounce == 0) {
      let newGesturePass = false;
      let timeout = 3;
      while (!newGesturePass) {
        timeout--;
        if (timeout == 0) return; // To prevent a looping issue
        let newGesture = emotionGestures[Math.floor(Math.random() * emotionGestures.length)].name;
        if (gestureOldRef.current != newGesture) {
          newGesturePass = true;
          setGesture(newGesture);
        }
      }
    } else {
      setGesture("");
    }
  }, [props.animationClips, 
      props.animationGestures, 
      animationState.current, 
      emotionState,
      gestureOldRef.current,
  ]);

  // Handles gesture playing if one is selected but not currently playing one
  useEffect(() => {
    if (animatorReady && gesture != "" && gestureOldRef.current != gesture && animationState.current == ANIMATION_TYPE.IDLE ) {
      gestureOldRef.current = gesture;
      playGesture();
    }
  }, [animatorReady, gesture, animationState.current, gestureOldRef.current]);

  return <>
          <Facial 
            emotionEvent={props.emotionEvent}
            emotionFace={props.emotionFace} 
            facialMaterials={props.facialMaterials} 
            facialMeshes={props.facialMeshes} 
            isReady={props.isReady}
            phonemes={props.phonemes}
          />
        </>;
}
