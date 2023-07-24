import { EmotionEvent } from '@inworld/web-sdk';

export type AnimationFile = {
  name: string;
  emotion: EMOTIONS;
  type: ANIMATION_TYPE;
  file: string;
};

export type AnimationGesture = {
  duration: number;
  emotion: EMOTIONS;
  name: string;
};

export enum CHAT_VIEW {
  TEXT = 'Text',
  AVATAR = 'Avatar',
  INNEQUIN = 'Innequin',
}

export type Configuration = {
  ANIMATIONS_URI: string;
  DEFAULT_ANIMATION: string;
  GENERATE_TOKEN_URL: string;
  IMAGES_BODY_URI: string;
  IMAGES_FACIAL_URI: string;
  INWORLD_CHARACTER: string | undefined;
  INWORLD_SCENE: string | undefined;
  MODEL_URI: string;
  RPM_AVATAR: string | undefined;
};

export type ConfigurationSession = {
  audio: ConfigurationAudio;
  character?: ConfigurationCharacter;
  scene?: ConfigurationScene;
  player?: ConfigurationPlayer;
  chatView?: CHAT_VIEW;
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

export type ConfigurationAudio = {
  stopDuration?: number;
  stopTicks?: number;
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

export enum BODY_TEXTURE_TYPE {
  BRONZE = 'BRONZE',
  CAMO = 'CAMO',
  WOOD0 = 'WOOD0',
  WOOD1 = 'WOOD1',
  WOOD2 = 'WOOD2',
  WOOD3 = 'WOOD3',
  WOOD4 = 'WOOD4',
  SKITZ = 'SKITZ',
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
  BODY = 'body',
  FEATURE = 'feature',
  VISEME = 'viseme',
  EMOTE = 'emote',
}

export enum MESH_TYPES {
  BODY = 'body',
  BROW = 'brow',
  EYE = 'eye',
  MOUTH = 'mouth',
  NOSE = 'nose',
}

export enum MESH_IDS {
  BROW = 0,
  EYE = 1,
  MOUTH = 2,
  NOSE = 3,
  BODY = 4,
}

export enum TEXTURE_TYPES {
  ALPHA = 'alpha',
  COLOR = 'color',
  NORMAL = 'normal',
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
