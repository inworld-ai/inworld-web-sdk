import { AdditionalPhonemeInfo } from '@inworld/web-core';
import { MeshPhysicalMaterial, SkinnedMesh } from 'three';

import { FacialMaterialLoader } from '../../../loaders/FacialMaterialLoader';
import {
  EMOTIONS_FACE,
  FACE_TEXTURE_TYPES,
  FACE_TYPES,
  MATERIAL_TYPES,
} from '../../../types/types';
import { VISEME_TYPES, Visemes } from '../../../types/Viseme';
import { getVisemeData } from '../utils/InnequinPhonemesToViseme';

export interface InnequinMouthProps {
  facialMaterials: { [key: string]: FacialMaterialLoader | null };
  modelMeshes: { [key: string]: SkinnedMesh | null };
}

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

export class InnequinMouth {
  props: InnequinMouthProps;
  // TODO Following two are not currently used
  emotion: EMOTIONS_FACE;
  emotionOld: EMOTIONS_FACE;
  lastViseme: number;
  phonemeData: AdditionalPhonemeInfo[];
  visemeOffsetS: number;

  constructor(props: InnequinMouthProps) {
    this.props = props;
    this.emotion = EMOTIONS_FACE.NEUTRAL;
    this.lastViseme = 0;
    this.phonemeData = [];
    this.visemeOffsetS = 0;
    this.updateMouth();
  }

  setEmotion(emotion: EMOTIONS_FACE) {
    if (this.emotion !== emotion) {
      this.emotion = emotion;
      this.updateMouth();
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (phonemes.length > 0) {
      this.phonemeData = phonemes.filter(
        (phoneme) => phoneme.phoneme !== '<INTERSPERSE_CHARACTER>',
      );
      this.visemeOffsetS = 0;
    }
  }

  updateFrame(delta: number) {
    if (this.phonemeData.length) {
      this.visemeOffsetS += delta;
      const data = getVisemeData(this.visemeOffsetS, this.phonemeData);

      if (!data) {
        this.visemeOffsetS = 0;
        this.phonemeData = [];
        const offsets = getSpriteCoordFromViseme('sil');
        (
          this.props.modelMeshes[FACE_TYPES.MOUTH]
            ?.material as MeshPhysicalMaterial
        ).map?.offset.set(offsets.x, offsets.y);
        (
          this.props.modelMeshes[FACE_TYPES.MOUTH]
            ?.material as MeshPhysicalMaterial
        ).needsUpdate = true;

        return;
      }

      // Project the Viseme texture
      if (Visemes[data] && this.lastViseme !== data) {
        this.lastViseme = data;
        const offsets = getSpriteCoordFromViseme(Visemes[data]);
        (
          this.props.modelMeshes[FACE_TYPES.MOUTH]
            ?.material as MeshPhysicalMaterial
        ).map?.offset.set(offsets.x, offsets.y);
        (
          this.props.modelMeshes[FACE_TYPES.MOUTH]
            ?.material as MeshPhysicalMaterial
        ).needsUpdate = true;
      }
    }
  }

  updateMouth() {
    (
      this.props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
    ).map =
      this.props.facialMaterials[
        this.emotion.toLowerCase() +
          '_' +
          FACE_TEXTURE_TYPES.VISEMES +
          '_' +
          MATERIAL_TYPES.VISEME
      ]!.getTextureColor()!;
    const offsets = getSpriteCoordFromViseme('sil');
    (
      this.props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
    ).map?.offset.set(offsets.x, offsets.y);
    (
      this.props.modelMeshes[FACE_TYPES.MOUTH]?.material as MeshPhysicalMaterial
    ).needsUpdate = true;
  }
}
