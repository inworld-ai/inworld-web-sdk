// The following types get cast against the loaded JSON configuration file. The types match
// the structure of the JSON.

import { EmotionBehaviorCode } from '@inworld/web-core';

import {
  ANIMATION_TYPE,
  ASSET_TYPE,
  EMOTIONS_BODY,
  GENDER_TYPES,
  SkinType,
} from '../types/types';

export type InnequinConfiguration = {
  innequin: InnequinType;
};

export type InnequinType = {
  baseURIs: BaseURIsType;
  defaults: DefaultsType;
  animations: { [key: string]: InnequinAnimationType };
  assets: { [key: string]: AssetType };
  skins: { [key: string]: SkinType };
};

export type InnequinAnimationType = {
  emotion: EMOTIONS_BODY;
  type: ANIMATION_TYPE;
  file: string;
};

export type AssetType = {
  type: ASSET_TYPE;
  enabled: boolean;
};

export type BaseURIsType = {
  MODELS_ANIMATIONS_EMOTIONS: string;
  MODELS_BODY: string;
  TEXTURES_BODY: string;
  TEXTURES_FACIAL_EMOTIONS: string;
};

export type DefaultsType = {
  INTRO_ANIMATION: string;
  EMOTION: EmotionBehaviorCode;
  GENDER: GENDER_TYPES;
  MODEL: string;
  SKIN: string;
};
