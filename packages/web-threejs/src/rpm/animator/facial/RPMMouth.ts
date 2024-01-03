import { AdditionalPhonemeInfo } from '@inworld/web-core';
import { SkinnedMesh } from 'three';

import { RPMPhonemDataToViseme } from '../utils/RPMPhonemDataToViseme';

export interface RPMMouthProps {
  modelMesh: SkinnedMesh;
}

const VISEMES_AMOUNT = 15;
const VISEME_SIL_USERDATA_NAME = 'viseme_sil';

export class RPMMouth {
  modelMesh: SkinnedMesh;
  phonemeData: AdditionalPhonemeInfo[] = [];
  startingIndex: number;
  visemeOffsetS: number;

  constructor(props: RPMMouthProps) {
    this.modelMesh = props.modelMesh;
    this.phonemeData = [];
    this.startingIndex = -1;
    this.visemeOffsetS = 0;
    this.init();
  }

  init() {
    // Iterate through blendshape names in order to find the beginning of the
    // viseme sequence (viseme_sil + 14 next)
    for (let i = 0; i < this.modelMesh.userData.targetNames.length; i++) {
      if (this.modelMesh.userData.targetNames[i] === VISEME_SIL_USERDATA_NAME) {
        this.startingIndex = i;
        break;
      }
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    this.phonemeData = phonemes;
  }

  updateFrame(delta: number) {
    if (this.phonemeData.length && this.startingIndex != -1) {
      this.visemeOffsetS += delta;
      const data = RPMPhonemDataToViseme(this.visemeOffsetS, this.phonemeData);

      if (!data) {
        this.visemeOffsetS = 0;
        this.phonemeData = [];
        return;
      }
      for (let i = 0; i < VISEMES_AMOUNT; i++) {
        this.modelMesh.morphTargetInfluences![this.startingIndex + i] = data[i];
      }
    } else {
      if (this.modelMesh) {
        this.modelMesh.morphTargetInfluences![this.startingIndex] = 1; // then every other morph would be cancelled.
        for (let i = 1; i < VISEMES_AMOUNT; i++) {
          this.modelMesh.morphTargetInfluences![this.startingIndex + i] = 0;
        }
      }
    }
  }
}
