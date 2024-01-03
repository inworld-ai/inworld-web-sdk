// The following types get cast against the loaded JSON configuration file. The types match
// the structure of the JSON.

import { EmotionBehaviorCode } from '@inworld/web-core';

import { ANIMATION_TYPE, EMOTIONS_BODY } from '../types/types';

export type RPMConfiguration = {
  rpm: RPMType;
};

export type RPMType = {
  baseURIs: BaseURIsType;
  defaults: DefaultsType;
  animations: { [key: string]: RPMAnimationType };
};

export type RPMAnimationType = {
  emotion: EMOTIONS_BODY;
  type: ANIMATION_TYPE;
  file: string;
};

export type BaseURIsType = {
  ANIMATIONS_JSON: string;
  MODELS_BODY: string;
};

export type DefaultsType = {
  EMOTION: EmotionBehaviorCode;
  IDLE_ANIMATION: string;
  MODEL: string;
};
