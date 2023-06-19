import { useEffect, useCallback, useRef, useState } from "react";
import { MeshPhysicalMaterial, SkinnedMesh } from "three";
import { EMOTIONS_FACE, FACE_TYPES, MATERIAL_TYPES } from "../../../../types";
import { BehaviorToFacial } from "./BehaviorToFacial";
import { MaterialLoader } from "../../loaders/MaterialLoader";
import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-sdk';

import { Eye } from "./Eye";
import { Mouth } from "./Mouth";

interface FacialProps {
    emotionFace: EMOTIONS_FACE;
    facialMaterials: { [key: string]: MaterialLoader | null; };
    facialMeshes: { [key: string]: SkinnedMesh | null; };
    isReady: Boolean;
    phonemes: AdditionalPhonemeInfo[];
    emotionEvent?: EmotionEvent;
}

let emotion: EMOTIONS_FACE = EMOTIONS_FACE.NEUTRAL;

export function Facial(props: FacialProps) {
  
  const emotionRef = useRef(emotion);
  const emotionSetRef = useRef(emotion);

  // Facial Brow/Nose Emotion Change
  useEffect(() => {
    if (props.isReady) {
      Object.values(FACE_TYPES).forEach((valueFaceType) => {
        if (valueFaceType === FACE_TYPES.EYE || valueFaceType === FACE_TYPES.MOUTH) { return; };
        (props.facialMeshes[valueFaceType]?.material as MeshPhysicalMaterial).map 
          = props.facialMaterials[emotionRef.current + "_" + valueFaceType + "_" + MATERIAL_TYPES.FEATURE]!.getTextureColor()!;
        (props.facialMeshes[valueFaceType]?.material as MeshPhysicalMaterial).alphaMap 
          = props.facialMaterials[emotionRef.current + "_" + valueFaceType + "_" + MATERIAL_TYPES.FEATURE]!.getTextureAlpha()!;
        (props.facialMeshes[valueFaceType]?.material as MeshPhysicalMaterial).needsUpdate = true;
      });
      emotionSetRef.current = emotionRef.current;
    }
  }, [props.isReady, emotionRef.current, props.emotionFace, props.facialMaterials, props.facialMeshes]);

  useEffect(() => {
    if (props.emotionEvent) {
      emotionRef.current = BehaviorToFacial[props.emotionEvent.behavior.code];
    }
  }, [props.emotionEvent]);

  return <>
    <Eye 
      emotionFace={props.emotionFace} 
      facialMaterials={props.facialMaterials} 
      facialMeshes={props.facialMeshes} 
      emotionEvent={props.emotionEvent} 
      isReady={props.isReady}
      emotionRef={emotionSetRef}
    />
    <Mouth 
      emotionFace={props.emotionFace} 
      facialMaterials={props.facialMaterials} 
      facialMeshes={props.facialMeshes} 
      emotionEvent={props.emotionEvent} 
      phonemes={props.phonemes} 
      isReady={props.isReady} 
      emotionRef={emotionSetRef}
    />
  </>;

}