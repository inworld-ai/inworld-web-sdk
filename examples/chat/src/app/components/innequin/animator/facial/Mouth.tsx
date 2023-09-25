import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-sdk';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MeshPhysicalMaterial, SkinnedMesh } from 'three';

import { Visemes } from '../../../../../data/visemes';
import { VISEME_TYPES } from '../../../../types';
import {
  EMOTIONS_FACE,
  FACE_TEXTURE_TYPES,
  FACE_TYPES,
  MATERIAL_TYPES,
} from '../../data/types';
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

// Gets the id of the image place on the spritesheet for the viseme
function getSpriteIDFromViseme(viseme: string) {
  return Object.values(VISEME_TYPES)
    .sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    })
    .indexOf(viseme as VISEME_TYPES);
}

// Generates the X and Y offset position for the spritesheet based on viseme
function getSpriteCoordFromViseme(viseme: string) {
  const spriteId = getSpriteIDFromViseme(viseme);
  const gridCount = Math.ceil(Math.sqrt(Object.keys(VISEME_TYPES).length));
  const offsetFactor = 1 / gridCount;
  const offsetX = (spriteId % gridCount) * offsetFactor;
  const offsetY = Math.floor(spriteId / gridCount) * offsetFactor;
  return { x: offsetX, y: offsetY };
}

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
            FACE_TEXTURE_TYPES.VISEMES +
            '_' +
            MATERIAL_TYPES.VISEME
        ]!.getTextureColor()!;
      const offsets = getSpriteCoordFromViseme('sil');
      (
        props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
      ).map?.offset.set(offsets.x, offsets.y);
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
        const offsets = getSpriteCoordFromViseme('sil');
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).map?.offset.set(offsets.x, offsets.y);
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).needsUpdate = true;

        return;
      }

      // Project the Viseme texture
      if (Visemes[data] && lastViseme.current != data) {
        lastViseme.current = data;
        const offsets = getSpriteCoordFromViseme(Visemes[data]);
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).map?.offset.set(offsets.x, offsets.y);
        (
          props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
        ).needsUpdate = true;
      }
    }
  });

  return <></>;
}
