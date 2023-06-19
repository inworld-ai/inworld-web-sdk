import { 
  AnimationClip, 
  AnimationMixer, 
  Clock, 
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
  emotionFace: EMOTIONS_FACE;
  facialMaterials: { [key: string]: MaterialLoader | null; };
  facialMeshes: { [key: string]: SkinnedMesh | null; };
  isReady: Boolean;
  isModelLoaded: Boolean;
  model: Object3D;
  phonemes: AdditionalPhonemeInfo[];
  emotionEvent?: EmotionEvent;
}

const ANIMATION_FADE_TIME_S = 0.25;
const ANIMATION_FADE_TIME_GESTURE_OUT_S = 0.25;
const ANIMATION_GESTURE_DELAY_MIN_S = 1;
const ANIMATION_GESTURE_DELAY_MAX_S = 5;

let emotion: EMOTIONS = EMOTIONS.NEUTRAL;

// Those variables needed for immediate realtime animation playback.
// won't work with any sort of react useState as it is not immediate / realtime.
let talkingCurrentTime = 0;
let phonemeData: AdditionalPhonemeInfo[] = [];

export function Animator(props: AnimatorProps) {


  const animationIndexRef = useRef(0);
  const [animationMixer, setAnimationMixer] = useState<AnimationMixer | null>(null);
  const animationState = useRef(ANIMATION_TYPE.HELLO);
  const [animatorReady, setAnimatorReady] = useState(false);
  const clockRef = useRef(new Clock());
  const emotionRef = useRef(emotion);
  const emotionToChangeRef = useRef(emotion);
  const [gesture, setGesture] = useState("");
  const gestureDebounceRef = useRef(0);
  const gestureOldRef = useRef("");
  // const gestureRef = useRef("");
  const oldEmotionRef = useRef(emotion);

  // Create the AnimationMixer
  useEffect(() => {
    if (props.isReady && props.model && props.isModelLoaded) {
      // console.log("setAnimationMixer");
      setAnimationMixer(new AnimationMixer(props.model));
    }
  }, [props.isReady, props.model, props.isModelLoaded]);

  // Set Animator Ready
  useEffect(() => {
    if (props.isReady && animationMixer) {
      // console.log("setAnimatorReady");
      setAnimatorReady(true);
    }
  }, [props.isReady, animationMixer]);

  // Play Hello Animation
  useEffect(() => {
    // console.log('Hello Animation Check:', animatorReady, animationMixer, props.animationClips && emotionRef.current);
    if (animatorReady && animationMixer && props.animationClips && emotionRef.current) {
      // console.log('Hello Animation:', emotionRef.current);
      animationState.current = ANIMATION_TYPE.HELLO;
      animationMixer
      .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
      .play();
      // console.log("Hello Animation", + animationIndexRef.current, props.animationSequence[animationIndexRef.current]); 
      setTimeout(() => playIdle(), (props.animationClips[props.animationSequence[animationIndexRef.current]]!.duration) * 1000);
    }
  }, [animatorReady, props.animationClips, animationMixer, emotionRef.current]);

  // Handle Body Intro/Outro Changes
  useEffect(() => {
    if (animatorReady && emotionRef.current && oldEmotionRef.current != emotionRef.current) {
      // console.log('Body Animation Change:', emotionRef.current);
      if (oldEmotionRef.current == EMOTIONS.NEUTRAL ) {
        playIntro();
      } else {
        playOutro();
      }
    }
  }, [animatorReady, emotionRef.current, oldEmotionRef.current]);

  const playIdle = () => {
    if (props.isReady && animationMixer && animationState.current != ANIMATION_TYPE.IDLE) {
      animationState.current = ANIMATION_TYPE.IDLE;
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_GESTURE_OUT_S);
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(emotionRef.current) && animation.toLowerCase().includes(ANIMATION_TYPE.IDLE));
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_GESTURE_OUT_S)
        .play();
      oldEmotionRef.current = emotionRef.current;
      animationIndexRef.current = newIndex;
    }
  }

  const playIntro = () => {
    if (props.isReady && animationMixer && animationState.current != ANIMATION_TYPE.INTRO) {
      animationState.current = ANIMATION_TYPE.INTRO;
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(emotionRef.current) && animation.toLowerCase().includes(ANIMATION_TYPE.INTRO));
      const durTime = props.animationClips[props.animationSequence[newIndex]]!.duration;
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        .play();
      oldEmotionRef.current = emotionRef.current;
      animationIndexRef.current = newIndex;
      setTimeout(() => playIdle(), (durTime - ANIMATION_FADE_TIME_S) * 1000);
    }
  }

  const playOutro = () => {
    if (props.isReady && animationMixer && animationState.current != ANIMATION_TYPE.OUTRO) {
      animationState.current = ANIMATION_TYPE.OUTRO;
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( 
        animation => animation.toLowerCase().includes(oldEmotionRef.current) && animation.toLowerCase().includes(ANIMATION_TYPE.OUTRO));
      const durTime = props.animationClips[props.animationSequence[newIndex]]!.duration;
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        .play();
      oldEmotionRef.current = emotionRef.current;
      animationIndexRef.current = newIndex;
      if (emotionRef.current == EMOTIONS.NEUTRAL) {
        setTimeout(playIdle, (durTime - ANIMATION_FADE_TIME_S) * 1000);
      } else {
        setTimeout(playIntro, (durTime - ANIMATION_FADE_TIME_S) * 1000);
      }
    }
  }

  const playGesture = () => {
    if (props.isReady && animationMixer && animationState.current != ANIMATION_TYPE.GESTURE) {
      animationState.current = ANIMATION_TYPE.GESTURE;
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( animation => animation == gesture);
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        .play();
      oldEmotionRef.current = emotionRef.current;
      animationIndexRef.current = newIndex;
      const emotionGesture = props.animationGestures.find(animationGestures => animationGestures.name == gesture);
      setTimeout(playIdle, (emotionGesture?.duration! - ANIMATION_FADE_TIME_S) * 1000);
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
          // console.log("Current:", talkingCurrentTime, "Duration:", props.phonemes[props.phonemes.length - 1].startOffsetS);
          talkingCurrentTime += delta;
          if (gesture == "" && 
            animationState.current == ANIMATION_TYPE.IDLE && 
            talkingCurrentTime > ANIMATION_FADE_TIME_S &&
            talkingCurrentTime < phonemeData[phonemeData.length - 1].startOffsetS! ) {
            randomGesture(phonemeData[phonemeData.length - 1].startOffsetS! - talkingCurrentTime);
          } else if(talkingCurrentTime > phonemeData[phonemeData.length - 1].startOffsetS!) {
            // Reset data if talking time is over the phoneme length
            phonemeData = [];
            talkingCurrentTime = 0;
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
      emotionToChangeRef.current = BehaviorToBody[props.emotionEvent.behavior.code];
      gestureDebounceRef.current = 1;
    }
  }, [animatorReady, props.emotionEvent]);

  useEffect(() => {
    if (animatorReady && emotionToChangeRef.current) {
      // console.log('Emotion Change', emotionRef.current, emotionToChangeRef.current);
      emotionRef.current = emotionToChangeRef.current;
      gestureDebounceRef.current = 1;
    }
  }, [animatorReady, emotionToChangeRef.current]);

  // Handles choosing a random gesture
  const randomGesture = useCallback((maxDuration: number) => {
    const emotionGestures = props.animationGestures.filter(gesture => gesture.emotion == emotionRef.current && gesture.duration < maxDuration - ANIMATION_FADE_TIME_S);
    if (emotionGestures.length > 0 && animationState.current == ANIMATION_TYPE.IDLE && gestureDebounceRef.current == 0) {
      let newGesturePass = false;
      let timeout = 3;
      while (!newGesturePass) {
        timeout--;
        if (timeout == 0) return;
        let newGesture = emotionGestures[Math.floor(Math.random() * emotionGestures.length)].name;
        console.log("newGesturePass", newGesture, gestureOldRef.current);
        if (gestureOldRef.current != newGesture) {
          newGesturePass = true;
          setGesture(newGesture);
        }
      }
    } else {
      // Used to skip gestures
      if (gestureDebounceRef.current == 1) {
        gestureDebounceRef.current = 0;
      }
      setGesture("");
    }
  }, [props.animationClips, 
      props.animationGestures, 
      animationState.current, 
      emotionRef.current, 
      gestureDebounceRef.current,
      gestureOldRef.current,
    ]);

  // Handles gesture playing if one is selected but not currently playing one
  useEffect(() => {
    if (animatorReady && gesture != "" && animationState.current != ANIMATION_TYPE.GESTURE ) {
      gestureOldRef.current = gesture;
      playGesture();
    }
  }, [animatorReady, gesture, animationState.current]);

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
