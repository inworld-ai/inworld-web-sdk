import { useEffect, useRef, useState } from "react";
import { MeshPhysicalMaterial, SkinnedMesh } from "three";
import { EMOTIONS_FACE, EYE_STATES, FACE_TYPES, MATERIAL_TYPES } from "../../../../types";
import { MaterialLoader } from "../../loaders/MaterialLoader";
import { EmotionEvent } from '@inworld/web-sdk';

interface EyeProps {
    emotionFace: EMOTIONS_FACE;
    facialMaterials: { [key: string]: MaterialLoader | null; };
    facialMeshes: { [key: string]: SkinnedMesh | null; };
    isReady: Boolean;
    emotionEvent?: EmotionEvent;
    emotionRef: React.MutableRefObject<EMOTIONS_FACE>;
}

export function Eye(props: EyeProps) {
  
  const BLINK_DURATION_MS = 250;
  const BLINK_INTERVAL_MIN_MS = 1000;
  const BLINK_INTERVAL_MAX_MS = 5000;

  const blinkDurationRef = useRef<NodeJS.Timeout>();
  const blinkIntervalRef = useRef<NodeJS.Timeout>();
  const [isBlinking, setIsBlinkng] = useState(false);

  // Facial Eye Emotion/Blink Change
  useEffect(() => {
    if (props.isReady) {
      const eyeFaceType: EYE_STATES = isBlinking ? EYE_STATES.EYE_BLINK : EYE_STATES.EYE;
      (props.facialMeshes[FACE_TYPES.EYE]?.material as MeshPhysicalMaterial).map 
        = props.facialMaterials[props.emotionRef.current + "_" + eyeFaceType + "_" + MATERIAL_TYPES.FEATURE]!.getTextureColor()!;
      (props.facialMeshes[FACE_TYPES.EYE]?.material as MeshPhysicalMaterial).alphaMap 
        = props.facialMaterials[props.emotionRef.current + "_" + eyeFaceType + "_" + MATERIAL_TYPES.FEATURE]!.getTextureAlpha()!;
      (props.facialMeshes[FACE_TYPES.EYE]?.material as MeshPhysicalMaterial).needsUpdate = true;
    }
  }, [props.isReady, props.emotionRef.current, props.emotionFace, props.facialMaterials, props.facialMeshes, isBlinking]);

  // Blink Change Timer
  useEffect(() => {
    if (props.isReady && !isBlinking) {
      blinkIntervalRef.current = setTimeout(() => {
        setIsBlinkng(true);
      }, randomInt(BLINK_INTERVAL_MIN_MS, BLINK_INTERVAL_MAX_MS));
      return () => {
        clearTimeout(blinkIntervalRef.current);
      }
    }
  }, [props.isReady, isBlinking]);

  // Unblink Change Timer
  useEffect(() => {
    if (props.isReady && isBlinking) {
      blinkDurationRef.current = setTimeout(() => {
        setIsBlinkng(false);
      }, BLINK_DURATION_MS);
      return () => {
        clearTimeout(blinkDurationRef.current);
      }
    }
  }, [props.isReady, isBlinking]);

  function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  
  return <></>;

}