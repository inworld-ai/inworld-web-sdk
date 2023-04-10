import { EmotionEvent } from '@inworld/web-sdk';

/* eslint-disable */
export const FacialEmotionMap: { [key: string]: { [key: string]: number } } = {
  Neutral: {},
  Anger: {
    eyeClosed: 20,
    eyeSquintLeft: 50,
    eyeSquintRight: 50,
    mouthShrugUpper: 40,
    browDownLeft: 100,
    browDownRight: 100,
    noseSneerLeft: 100,
    noseSneerRight: 100,
  },
  Anticipation: {
    mouthSmile: 30,
    eyeSquintLeft: 60,
    eyeSquintRight: 60,
    mouthRollLower: 50,
    mouthRollUpper: 30,
    mouthShrugLower: 30,
    browInnerUp: 40,
    browOuterUpLeft: 40,
    browOuterUpRight: 40,
  },
  Disgust: {
    eyeSquintLeft: 100,
    eyeSquintRight: 100,
    mouthUpperUpLeft: 70,
    browInnerUp: 100,
    noseSneerLeft: 100,
    noseSneerRight: 100,
  },
  Fear: {
    mouthOpen: 30,
    eyeWideLeft: 50,
    eyeWideRight: 50,
    browInnerUp: 60,
    browOuterUpLeft: 40,
    browOuterUpRight: 40,
  },
  Joy: {
    mouthSmile: 20,
    eyeSquintLeft: 50,
    eyeSquintRight: 50,
    browInnerUp: 30,
    cheekSquintLeft: 60,
    cheekSquintRight: 60,
  },
  Sadness: {
    eyesClosed: 30,
    jawForward: 30,
    mouthFrownLeft: 50,
    mouthFrownRight: 50,
    mouthRollLower: 80,
    mouthShrugLower: 50,
    mouthShrugUpper: 60,
    browInnerUp: 50,
  },
  Surprise: {
    mouthSmile: 50,
    eyeWideLeft: 60,
    eyeWideRight: 60,
    jawOpen: 10,
    browInnerUp: 70,
    browOuterUpLeft: 70,
    browOuterUpRight: 70,
  },
};

export const behaviorToFacial = ({ behavior }: EmotionEvent) => {
  switch (true) {
    case behavior.isNeutral():
      return 'Neutral';
    case behavior.isDisgust():
    case behavior.isContempt():
    case behavior.isStonewalling():
      return 'Disgust';
    case behavior.isBelligerence():
    case behavior.isDomineering():
    case behavior.isCriticism():
    case behavior.isAnger():
      return 'Anger';
    case behavior.isTension():
    case behavior.isTenseHumor():
    case behavior.isDefensiveness():
      return 'Fear';
    case behavior.isSadness():
    case behavior.isWhining():
      return 'Sadness';
    case behavior.isAffection():
    case behavior.isInterest():
    case behavior.isHumor():
    case behavior.isJoy():
      return 'Joy';
    case behavior.isSurprise():
    case behavior.isValidation():
      return 'Surprise';
    default:
      return 'Neutral';
  }
};
