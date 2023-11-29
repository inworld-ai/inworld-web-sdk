import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-core';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MeshPhysicalMaterial, SkinnedMesh } from 'three';

import { Visemes } from '../../../../../data/visemes';
import { VISEME_TYPES } from '../../../../types';
import { EMOTIONS_FACE, FACE_TYPES, MATERIAL_TYPES } from '../../data/types';
import { FaceMaterialLoader } from '../../loaders/FaceMaterialLoader';
import { getVisemeData } from './PhonemesToViseme';

interface MouthProps {
  emotionEvent?: EmotionEvent;
  emotionRef: React.MutableRefObject<EMOTIONS_FACE>;
  facialMaterials: { [key: string]: FaceMaterialLoader | null };
  isReady: Boolean;
  modelMeshes: { [key: string]: SkinnedMesh | null };
  phonemes: AdditionalPhonemeInfo[];
}

// those variables needed for immediate realtime animation playback.
// won't work with any sort of react useState as it is not immediate / realtime.
let visemeOffsetS = 0;
let phonemeData: AdditionalPhonemeInfo[] = [];

export function Mouth(props: MouthProps) {
  const lastViseme = useRef(0);

  // Facial Mouth Emotion Change
  useEffect(() => {
    if (props.isReady) {
      (
        props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
      ).map =
        props.facialMaterials[
          props.emotionRef.current +
            '_' +
            FACE_TYPES.MOUTH +
            '_' +
            MATERIAL_TYPES.FEATURE
        ]!.getTextureColor()!;
      (
        props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
      ).alphaMap =
        props.facialMaterials[
          props.emotionRef.current +
            '_' +
            FACE_TYPES.MOUTH +
            '_' +
            MATERIAL_TYPES.FEATURE
        ]!.getTextureAlpha()!;
      (
        props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
      ).needsUpdate = true;
    }
  }, [
    props.isReady,
    props.emotionRef.current,
    props.facialMaterials,
    props.modelMeshes,
  ]);

  // Facial Mouth Emotion Change Upon Phonemes Being Received
  useEffect(() => {
    if (props.isReady && props.phonemes.length > 0) {
      phonemeData = props.phonemes.filter(
        (phoneme) => phoneme.phoneme != '<INTERSPERSE_CHARACTER>',
      );
      visemeOffsetS = 0;
    }
  }, [props.isReady, props.phonemes]);

  useFrame((state, delta) => {
    if (phonemeData.length) {
      visemeOffsetS += delta;
      const data = getVisemeData(visemeOffsetS, phonemeData);

      if (!data) {
        visemeOffsetS = 0;
        phonemeData = [];

        // Reset face to neutral when talking is done
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).map =
          props.facialMaterials[
            props.emotionRef.current +
              '_' +
              VISEME_TYPES.SIL +
              '_' +
              MATERIAL_TYPES.VISEME
          ]!.getTextureColor()!;
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).alphaMap =
          props.facialMaterials[
            props.emotionRef.current +
              '_' +
              VISEME_TYPES.SIL +
              '_' +
              MATERIAL_TYPES.VISEME
          ]!.getTextureAlpha()!;
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).needsUpdate = true;

        return;
      }

      // Project the Viseme texture
      if (Visemes[data] && lastViseme.current != data) {
        lastViseme.current = data;
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).map =
          props.facialMaterials[
            props.emotionRef.current +
              '_' +
              Visemes[data] +
              '_' +
              MATERIAL_TYPES.VISEME
          ]!.getTextureColor()!;
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).alphaMap =
          props.facialMaterials[
            props.emotionRef.current +
              '_' +
              Visemes[data] +
              '_' +
              MATERIAL_TYPES.VISEME
          ]!.getTextureAlpha()!;
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).needsUpdate = true;
      }
    }
  });

  return <></>;
}
