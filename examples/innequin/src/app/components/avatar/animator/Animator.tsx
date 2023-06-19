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
  const clockRef = useRef(new Clock());
  const emotionRef = useRef(emotion);
  const [gesture, setGesture] = useState("");
  const gestureDebounceRef = useRef(0);
  const gestureOldRef = useRef("");
  // const gestureRef = useRef("");
  const oldEmotionRef = useRef(emotion);

  // Body Animation Changes
  useEffect(() => {
    if (props.isReady) {
      if (oldEmotionRef.current == EMOTIONS.NEUTRAL ) {
        playIntro();
      } else {
        playOutro();
      }
    }
  }, [props.isReady, emotionRef.current]);

  // Hello Animation
  useEffect(() => {
    if (props.isReady && animationMixer && props.animationClips) {
      animationState.current = ANIMATION_TYPE.HELLO;
      animationMixer
      .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
      .play();  
    }
    setTimeout(() => playIdle(), (props.animationClips[props.animationSequence[animationIndexRef.current]]!.duration - ANIMATION_FADE_TIME_S) * 1000);
  }, [props.isReady, props.animationClips, animationMixer]);

  const playIdle = () => {
    if (animationMixer) {
      animationState.current = ANIMATION_TYPE.IDLE;
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(emotionRef.current) && animation.toLowerCase().includes(ANIMATION_TYPE.IDLE));
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        // .setLoop(LoopPingPong, 20)
        .play();
      oldEmotionRef.current = emotionRef.current;
      animationIndexRef.current = newIndex;
    }
  }

  const playIntro = () => {
    if (animationMixer) {
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
    if (animationMixer) {
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
    if (animationMixer) {
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
      setTimeout(playIdle, (emotionGesture?.duration!) * 1000);
    }
  }

  useEffect(() => {
    if (props.model && props.isModelLoaded) {
      setAnimationMixer(new AnimationMixer(props.model));
    }
  }, [props.model, props.isModelLoaded]);

  useFrame((state, delta) => {

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

  });

  // Handles storing the phonomes
  useEffect(() => {
    if (props.isReady && props.phonemes.length > 0) {
      console.log("Set Phonemes");
      phonemeData = props.phonemes;
      talkingCurrentTime = 0;
      setGesture("");
    }
  }, [props.isReady, props.phonemes]);

  // Handles change in emotion
  useEffect(() => {
    if (props.emotionEvent) {
      emotionRef.current = BehaviorToBody[props.emotionEvent.behavior.code];
      gestureDebounceRef.current = 1;
    }
  }, [props.emotionEvent]);

  // Handles choosing a random gesture
  const randomGesture = useCallback((maxDuration: number) => {
    const emotionGestures = props.animationGestures.filter(gesture => gesture.emotion == emotionRef.current && gesture.duration < maxDuration);
    if (emotionGestures.length > 0 && animationState.current != ANIMATION_TYPE.GESTURE && gestureDebounceRef.current == 0) {
      let newGesturePass = false;
      while (!newGesturePass) {
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
    if (gesture != "" && animationState.current != ANIMATION_TYPE.GESTURE ) {
      gestureOldRef.current = gesture;
      playGesture();
    }
  }, [gesture, animationState.current]);

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
