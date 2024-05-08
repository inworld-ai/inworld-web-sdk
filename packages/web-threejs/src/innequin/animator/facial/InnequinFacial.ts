import { AdditionalPhonemeInfo } from '@inworld/web-core';
import { MeshPhysicalMaterial, SkinnedMesh } from 'three';

import { FacialMaterialLoader } from '../../../loaders/FacialMaterialLoader';
import {
  EMOTIONS_FACE,
  FACE_TYPES,
  MATERIAL_TYPES,
} from '../../../types/types';
import { InnequinEyes } from './InnequinEyes';
import { InnequinMouth } from './InnequinMouth';

export interface InnequinFacialProps {
  facialMaterials: { [key: string]: FacialMaterialLoader | null };
  modelMeshes: { [key: string]: SkinnedMesh | null };
}

export class InnequinFacial {
  emotion: EMOTIONS_FACE;
  eye: InnequinEyes;
  mouth: InnequinMouth;
  phonemes: AdditionalPhonemeInfo[];
  props: InnequinFacialProps;

  constructor(props: InnequinFacialProps) {
    this.props = props;
    this.eye = new InnequinEyes({
      facialMaterials: props.facialMaterials,
      modelMeshes: props.modelMeshes,
    });
    this.mouth = new InnequinMouth({
      facialMaterials: props.facialMaterials,
      modelMeshes: props.modelMeshes,
    });
    this.init();
  }

  init() {}

  setEmotion(emotion: EMOTIONS_FACE) {
    this.emotion = emotion;
    Object.values(FACE_TYPES).forEach((valueFaceType) => {
      if (
        valueFaceType === FACE_TYPES.EYE ||
        valueFaceType === FACE_TYPES.MOUTH
      ) {
        return;
      }
      (
        this.props.modelMeshes[valueFaceType]?.material as MeshPhysicalMaterial
      ).map =
        this.props.facialMaterials[
          emotion.toLowerCase() +
            '_' +
            valueFaceType +
            '_' +
            MATERIAL_TYPES.FEATURE
        ]!.getTextureColor()!;
      (
        this.props.modelMeshes[valueFaceType]?.material as MeshPhysicalMaterial
      ).needsUpdate = true;
    });
    this.eye.setEmotion(emotion);
    this.mouth.setEmotion(emotion);
  }

  updateFrame(delta: number) {
    if (this.mouth) {
      this.mouth.updateFrame(delta);
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (phonemes.length > 0) {
      this.phonemes = phonemes;
      this.mouth.setPhonemes(phonemes);
    }
  }
}
