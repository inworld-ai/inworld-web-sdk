import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-sdk';
import { useEffect, useRef } from 'react';
import { MeshPhysicalMaterial, SkinnedMesh } from 'three';

import { EMOTIONS_FACE, FACE_TYPES, MATERIAL_TYPES } from '../../../../types';
import { FaceMaterialLoader } from '../../loaders/FaceMaterialLoader';
import { BehaviorToFacial } from './BehaviorToFacial';
import { Eye } from './Eye';
import { Mouth } from './Mouth';

interface FacialProps {
  emotionFace: EMOTIONS_FACE;
  facialMaterials: { [key: string]: FaceMaterialLoader | null };
  isReady: Boolean;
  modelMeshes: { [key: string]: SkinnedMesh | null };
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
        if (
          valueFaceType === FACE_TYPES.EYE ||
          valueFaceType === FACE_TYPES.MOUTH
        ) {
          return;
        }
        (
          props.modelMeshes[valueFaceType]?.material as MeshPhysicalMaterial
        ).map =
          props.facialMaterials[
            emotionRef.current +
              '_' +
              valueFaceType +
              '_' +
              MATERIAL_TYPES.FEATURE
          ]!.getTextureColor()!;
        (
          props.modelMeshes[valueFaceType]?.material as MeshPhysicalMaterial
        ).alphaMap =
          props.facialMaterials[
            emotionRef.current +
              '_' +
              valueFaceType +
              '_' +
              MATERIAL_TYPES.FEATURE
          ]!.getTextureAlpha()!;
        (
          props.modelMeshes[valueFaceType]?.material as MeshPhysicalMaterial
        ).needsUpdate = true;
      });
      emotionSetRef.current = emotionRef.current;
    }
  }, [
    props.isReady,
    emotionRef.current,
    props.emotionFace,
    props.facialMaterials,
    props.modelMeshes,
  ]);

  useEffect(() => {
    if (props.emotionEvent) {
      emotionRef.current = BehaviorToFacial[props.emotionEvent.behavior.code];
    }
  }, [props.emotionEvent]);

  return (
    <>
      <Eye
        emotionEvent={props.emotionEvent}
        emotionFace={props.emotionFace}
        emotionRef={emotionSetRef}
        facialMaterials={props.facialMaterials}
        isReady={props.isReady}
        modelMeshes={props.modelMeshes}
      />
      <Mouth
        emotionEvent={props.emotionEvent}
        emotionFace={props.emotionFace}
        emotionRef={emotionSetRef}
        facialMaterials={props.facialMaterials}
        isReady={props.isReady}
        modelMeshes={props.modelMeshes}
        phonemes={props.phonemes}
      />
    </>
  );
}
