import { MathUtils, SkinnedMesh } from 'three';

export interface RPMEyesProps {
  modelMesh: SkinnedMesh;
}

const EYES_CLOSED = 'eyesClosed';
const BLINK_SPEED = 1;
const BLINK_THRESH = 1000;

export class RPMEyes {
  elapsdTime: number;
  modelMesh: SkinnedMesh;
  eyesClosedIndex: number;

  constructor(props: RPMEyesProps) {
    this.elapsdTime = 0;
    this.eyesClosedIndex = -1;
    this.modelMesh = props.modelMesh;
    // Iterate through blendshape names in order to find the beginning of the
    // viseme sequence (viseme_sil + 14 next)
    for (let i = 0; i < this.modelMesh.userData.targetNames.length; i++) {
      if (this.modelMesh.userData.targetNames[i] === EYES_CLOSED) {
        this.eyesClosedIndex = i;
        break;
      }
    }
  }

  updateFrame(delta: number) {
    // Blinking Animation
    if (this.modelMesh) {
      this.elapsdTime += delta;
      let eyeClosedVal = MathUtils.clamp(
        Math.sin(this.elapsdTime * BLINK_SPEED) * BLINK_THRESH -
          BLINK_THRESH +
          1,
        0,
        1,
      );
      if (this.eyesClosedIndex !== -1) {
        this.modelMesh.morphTargetInfluences![this.eyesClosedIndex] =
          eyeClosedVal;
      }
    }
  }
}
