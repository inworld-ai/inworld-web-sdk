import { AdditionalPhonemeInfo } from '@inworld/web-core';
import { MathUtils, SkinnedMesh } from 'three';

import { RPMFacialEmotionMap } from '../utils/RPMFacialEmotionMap';
import { RPMEyes } from './RPMEyes';
import { RPMMouth } from './RPMMouth';

export interface RPMFacialProps {
  modelMesh: SkinnedMesh;
}

const MORPH_DURATION = 0.25;
const LERP_FACTOR = 0.25;

export class RPMFacial {
  eye: RPMEyes;
  emotion: string;
  emotionOld: string;
  modelMesh: SkinnedMesh;
  morphTime: number;
  mouth: RPMMouth;

  constructor(props: RPMFacialProps) {
    this.modelMesh = props.modelMesh;
    this.emotion = 'Neutral';
    this.emotionOld = 'Neutral';
    this.morphTime = 0;
    this.eye = new RPMEyes({ modelMesh: this.modelMesh });
    this.mouth = new RPMMouth({ modelMesh: this.modelMesh });
  }

  getMorphIndex(name: string) {
    let nResult = -1;
    if (this.modelMesh) {
      for (let i = 0; i < this.modelMesh.userData.targetNames.length; i++) {
        if (this.modelMesh.userData.targetNames[i] === name) {
          nResult = i;
          break;
        }
      }
    }
    return nResult;
  }

  setEmotion(emotion: string) {
    if (emotion) {
      // this.emotionState = BehaviorToBody[emotion];
      this.emotion = emotion;
      // this.updateEmotion();
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    this.mouth.setPhonemes(phonemes);
  }

  updateFrame(delta: number) {
    // Facial emotional morphing
    if (this.emotion != this.emotionOld) {
      this.morphTime += delta;

      if (RPMFacialEmotionMap[this.emotion]) {
        // Reset old emotion
        if (RPMFacialEmotionMap[this.emotionOld]) {
          for (const [key, _] of Object.entries(
            RPMFacialEmotionMap[this.emotionOld],
          )) {
            const targetVal = RPMFacialEmotionMap[this.emotion][key] ?? 0;
            const targetIndex = this.getMorphIndex(key);
            if (targetIndex != -1) {
              this.modelMesh.morphTargetInfluences![targetIndex] =
                MathUtils.lerp(
                  this.modelMesh.morphTargetInfluences![targetIndex],
                  targetVal * 0.01,
                  LERP_FACTOR,
                );
            }
          }
        }
        // Add new emotion
        for (const [key, value] of Object.entries(
          RPMFacialEmotionMap[this.emotion],
        )) {
          const targetIndex = this.getMorphIndex(key);
          if (targetIndex != -1) {
            this.modelMesh.morphTargetInfluences![targetIndex] = MathUtils.lerp(
              this.modelMesh.morphTargetInfluences![targetIndex],
              value * 0.01,
              LERP_FACTOR,
            );
          }
        }
      }
      if (this.morphTime >= MORPH_DURATION) {
        this.morphTime = 0;
        this.emotionOld = this.emotion;
      }
    }

    this.eye.updateFrame(delta);
    this.mouth.updateFrame(delta);
  }
}
