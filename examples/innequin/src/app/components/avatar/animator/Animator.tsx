import { 
  AnimationClip, 
  AnimationMixer, 
  Clock, 
  FrontSide, 
  MeshPhysicalMaterial, 
  Object3D, 
  SkinnedMesh,
  Texture, 
  TextureLoader } from "three";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import { GLTF } from 'three-stdlib';
import { MaterialLoader } from "../loaders/MaterialLoader";
import { AnimationFile, ANIMATION_TYPE, EMOTIONS, EMOTIONS_FACE, FACE_TYPES, MATERIAL_TYPES } from '../../../types';
import { Facial } from "./facial/Facial";
import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-sdk';
import {BehaviorToBody} from './BehaviorToBody';

interface AnimatorProps {
  animationClips: { [key: string]: AnimationClip | null; };
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
const END_TALKING_DEBOUNCE_TIME_MS = 500;

let emotion: EMOTIONS = EMOTIONS.NEUTRAL;

export function Animator(props: AnimatorProps) {

  // console.log('Animator');

  const [animationMixer, setAnimationMixer] = useState<AnimationMixer | null>(null);

  const emotionRef = useRef(emotion);
  const oldEmotionRef = useRef(emotion);
  const animationIndexRef = useRef(0);
  const clockRef = useRef(new Clock());

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
      // console.log("Playing: " + props.animationSequence[animationIndexRef.current] + " " + props.animationClips[props.animationSequence[animationIndexRef.current]]!.duration);
      animationMixer
      .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
      .play();  
    }
    setTimeout(() => playIdle(), (props.animationClips[props.animationSequence[animationIndexRef.current]]!.duration - ANIMATION_FADE_TIME_S) * 1000);
  }, [props.isReady, props.animationClips, animationMixer]);

  const playIdle = () => {

    if (animationMixer) {

      // console.log('playIdle Old', props.animationSequence[animationIndexRef.current]);

      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        // .stop()
        .fadeOut(ANIMATION_FADE_TIME_S);
      
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(emotionRef.current) && animation.toLowerCase().includes(ANIMATION_TYPE.IDLE));

      // console.log('playIdle New', props.animationSequence[newIndex]);

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

      // console.log('playIntro Old', props.animationSequence[animationIndexRef.current]);

      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        // .stop()
        .fadeOut(ANIMATION_FADE_TIME_S);
      
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(emotionRef.current) && animation.toLowerCase().includes(ANIMATION_TYPE.INTRO));

      // animationIndex = animationIndex == 12 ? 1 : animationIndex + 1;

      const durTime = props.animationClips[props.animationSequence[newIndex]]!.duration;

      // console.log('playIntro New', props.animationSequence[newIndex]);

      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        // .setLoop(LoopPingPong, 20)
        .play();

      
      oldEmotionRef.current = emotionRef.current;
      animationIndexRef.current = newIndex;
      
      setTimeout(() => playIdle(), (durTime - ANIMATION_FADE_TIME_S) * 1000);

    }
  }

  const playOutro = () => {
    if (animationMixer) {
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
      
      const newIndex = props.animationSequence.findIndex( animation => animation.toLowerCase().includes(oldEmotionRef.current) && animation.toLowerCase().includes(ANIMATION_TYPE.OUTRO));

      console.log('playOutro ' + newIndex + " " + oldEmotionRef.current);

      // animationIndex = animationIndex == 12 ? 1 : animationIndex + 1;

      console.log('playOutro ' + newIndex);

      const durTime = props.animationClips[props.animationSequence[newIndex]]!.duration;

      // console.log("Playing: ", props.animationSequence[newIndex], durTime);

      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        // .setLoop(LoopPingPong, 20)
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

  // Cycle Process MAYBE REMOVED
  const playNext = () => {
    if (animationMixer) {
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[animationIndexRef.current]]!)
        .fadeOut(ANIMATION_FADE_TIME_S);
        
      const newIndex = animationIndexRef.current == 12 ? 1 : animationIndexRef.current + 1;

      const durTime = props.animationSequence[newIndex].includes(ANIMATION_TYPE.IDLE) ? 5 : props.animationClips[props.animationSequence[newIndex]]!.duration;

      // console.log("Playing: " + props.animationSequence[newIndex] + " " + durTime);
      animationMixer
        .clipAction(props.animationClips[props.animationSequence[newIndex]]!)
        .reset()
        .fadeIn(ANIMATION_FADE_TIME_S)
        // .setLoop(LoopPingPong, 20)
        .play();
      
      animationIndexRef.current = newIndex;

      setTimeout(playNext, (durTime - ANIMATION_FADE_TIME_S) * 1000);
    }
  };

  useEffect(() => {
    if (props.model && props.isModelLoaded) {
      setAnimationMixer(new AnimationMixer(props.model));
    }
  }, [props.model, props.isModelLoaded]);

  useFrame((state, delta) => {
    if (animationMixer instanceof AnimationMixer) {
      animationMixer.update(clockRef.current.getDelta());
      props.model.rotation.set(0, 0, 0);
    }
  });

  useEffect(() => {
    if (props.emotionEvent) {
      emotionRef.current = BehaviorToBody[props.emotionEvent.behavior.code];
    }
  }, [props.emotionEvent]);

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
