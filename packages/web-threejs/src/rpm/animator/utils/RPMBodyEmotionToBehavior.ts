// This maps the full list of Body emotions to the EmotionBehaviorCode enum, the ones currently supported for
// Ready Player Me's body expressions

// Note: This is note a 1 to 1 relationship. There are many body emotions to EmotionBehaviorCode.

import { EmotionBehaviorCode } from '@inworld/web-core';

export const RPMBodyEmotionToBehavior: {
  [key: string]: EmotionBehaviorCode;
} = {
  NEUTRAL: EmotionBehaviorCode.NEUTRAL,
};
