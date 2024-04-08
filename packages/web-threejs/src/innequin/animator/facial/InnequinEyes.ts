import { MeshPhysicalMaterial, SkinnedMesh } from 'three';

import { FacialMaterialLoader } from '../../../loaders/FacialMaterialLoader';
import {
  EMOTIONS_FACE,
  EYE_STATES,
  FACE_TYPES,
  MATERIAL_TYPES,
} from '../../../types/types';

export interface InnequinEyesProps {
  facialMaterials: { [key: string]: FacialMaterialLoader | null };
  modelMeshes: { [key: string]: SkinnedMesh | null };
}

const BLINK_DURATION_MS = 250;
const BLINK_INTERVAL_MIN_MS = 1000;
const BLINK_INTERVAL_MAX_MS = 5000;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class InnequinEyes {
  blinkTimerDuration: NodeJS.Timeout;
  blinkTimerInterval: NodeJS.Timeout;
  props: InnequinEyesProps;
  // TODO Following two are not currently used
  emotion: EMOTIONS_FACE;
  emotionOld: EMOTIONS_FACE;
  isBlinking: boolean;

  constructor(props: InnequinEyesProps) {
    this.props = props;
    this.emotion = EMOTIONS_FACE.NEUTRAL;
    this.isBlinking = false;
    this.updateEye();
    this.startBlinking();
  }

  destructor() {
    if (this.blinkTimerInterval) clearTimeout(this.blinkTimerInterval);
    if (this.blinkTimerDuration) clearTimeout(this.blinkTimerDuration);
  }

  setEmotion(emotion: EMOTIONS_FACE) {
    if (this.emotion !== emotion) {
      this.emotion = emotion;
      this.updateEye();
    }
  }

  setBlinking(blink: boolean) {
    if (this.isBlinking !== blink) {
      this.isBlinking = blink;
      this.updateEye();
      if (blink) {
        this.stopBlinking();
      } else {
        this.startBlinking();
      }
    }
  }

  startBlinking() {
    if (!this.isBlinking) {
      this.blinkTimerInterval = setTimeout(
        () => {
          this.setBlinking(true);
        },
        randomInt(BLINK_INTERVAL_MIN_MS, BLINK_INTERVAL_MAX_MS),
      );
    }
  }

  stopBlinking() {
    if (this.isBlinking) {
      this.blinkTimerDuration = setTimeout(() => {
        this.setBlinking(false);
      }, BLINK_DURATION_MS);
    }
  }

  updateEye() {
    const eyeFaceType: EYE_STATES = this.isBlinking
      ? EYE_STATES.EYE_BLINK
      : EYE_STATES.EYE;
    (
      this.props.modelMeshes[FACE_TYPES.EYE]?.material as MeshPhysicalMaterial
    ).map =
      this.props.facialMaterials[
        this.emotion.toLowerCase() +
          '_' +
          eyeFaceType +
          '_' +
          MATERIAL_TYPES.FEATURE
      ]!.getTextureColor()!;

    (
      this.props.modelMeshes[FACE_TYPES.EYE]?.material as MeshPhysicalMaterial
    ).needsUpdate = true;
  }
}
