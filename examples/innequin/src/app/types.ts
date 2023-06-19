import { EmotionEvent } from '@inworld/web-sdk';

export type AnimationFile = {
  name: string;
  emotion: EMOTIONS;
  type: ANIMATION_TYPE;
  file: string;
}

export type AnimationGesture = {
  duration: number;
  emotion: EMOTIONS;
  name: string;
}

export type Configuration = {
  ANIMATIONS_URI: string;
  DEFAULT_ANIMATION: string;
  GENERATE_TOKEN_URL: string;
  IMAGES_FACIAL_URI: string;
  INWORLD_CHARACTER: string | undefined,
  INWORLD_SCENE: string | undefined,
  MODEL_URI: string;
};

export type ConfigurationCharacter = {
  name?: string;
};

export type ConfigurationScene = {
  name?: string;
};

export type ConfigurationPlayer = {
  name?: string;
};

export type ConfigurationSession = {
  character?: ConfigurationCharacter;
  scene?: ConfigurationScene;
  player?: ConfigurationPlayer;
  chatView?: CHAT_VIEW;
};

export interface EmotionsMap {
  [key: string]: EmotionEvent;
}

export enum ANIMATION_TYPE {
  IDLE = 'idle',
  GESTURE = 'gesture',
  INTRO = 'intro',
  OUTRO = 'outro',
  HELLO = 'hello',
}

export enum CHAT_VIEW {
  TEXT = 'Text',
  AVATAR = 'Avatar',
}

export enum EMOTIONS {
  ANGRY = 'angry',
  FEAR = 'fear',
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
}

export enum EMOTIONS_FACE {
  AFFECTION = 'affection',
  ANGRY = 'angry',
  FEAR = 'fear',
  HUMOR = 'humor',
  JOY = 'joy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
}

export enum EYE_STATES {
  EYE = 'eye',
  EYE_BLINK = 'eye_blink',
}

export enum FACE_TYPES {
  BROW = 'brow',
  EYE = 'eye',
  MOUTH = 'mouth',
  NOSE = 'nose',
}

export enum FACE_TEXTURE_TYPES {
  BROW = 'brow',
  EYE = 'eye',
  EYE_BLINK = 'eye_blink',
  MOUTH = 'mouth',
  NOSE = 'nose',
}

export enum MATERIAL_TYPES {
  FEATURE = 'feature',
  VISEME = 'viseme',
  EMOTE = 'emote',
}

export enum TEXTURE_TYPES {
  ALPHA = 'alpha',
  COLOR = 'color',
}

export enum VISEME_TYPES {
  SIL = 'sil',
  PP = 'PP',
  FF = 'FF',
  TH = 'TH',
  DD = 'DD',
  KK = 'kk',
  CH = 'CH',
  SS = 'SS',
  NN = 'nn',
  RR = 'RR',
  AA = 'aa',
  E = 'E',
  I = 'I',
  O = 'O',
  U = 'U',
}