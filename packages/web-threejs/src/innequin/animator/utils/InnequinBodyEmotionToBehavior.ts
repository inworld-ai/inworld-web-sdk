// This maps the full list of Body emotions to the EmotionBehaviorCode enum, the ones currently supported for
// Innequin's body expressions

// Note: This is note a 1 to 1 relationship. There are many body emotions to EmotionBehaviorCode.

import { EmotionBehaviorCode } from '@inworld/web-core';

export const InnequinBodyEmotionToBehavior: {
  [key: string]: EmotionBehaviorCode;
} = {
  NEUTRAL: EmotionBehaviorCode.NEUTRAL,
  ANGRY: EmotionBehaviorCode.CRITICISM,
  FEAR: EmotionBehaviorCode.TENSION,
  HAPPY: EmotionBehaviorCode.AFFECTION,
  SAD: EmotionBehaviorCode.SADNESS,
};
