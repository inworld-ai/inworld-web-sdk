import { EmotionEvent, Feedback } from '@inworld/web-core';

export enum CHAT_VIEW {
  TEXT = 'Text',
  MULTI_AGENT_TEXT = 'Text (multi agents)',
  AVATAR = 'Avatar',
  INNEQUIN = 'Innequin',
}

export type Configuration = {
  ANIMATIONS_URI: string;
  CAMERA_SETTINGS: ConfigurationCamera;
  DEFAULT_ANIMATION: string;
  DRACO_COMPRESSION_URI: string;
  GENERATE_TOKEN_URL: string;
  IMAGES_BODY_URI: string;
  IMAGES_FACIAL_URI: string;
  INWORLD_CHARACTER: string | undefined;
  INWORLD_SCENE: string | undefined;
  MODEL_URI: string;
  RPM_AVATAR: string | undefined;
  CONNECTION_HOSTNAME: string;
  CONNECTION_SSL: boolean;
};

export type ConfigurationCamera = {
  POS_X: number;
  POS_Y: number;
  POS_Z: number;
  TAR_X: number;
  TAR_Y: number;
  TAR_Z: number;
  FOV: number;
  NEAR: number;
  FAR: number;
};

export type ConfigurationSession = {
  audio: ConfigurationAudio;
  character?: ConfigurationCharacter;
  scene?: ConfigurationScene;
  player?: ConfigurationPlayer;
  chatView?: CHAT_VIEW;
  continuation?: Continuation;
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

export type Continuation = {
  enabled?: boolean;
  previousDialog?: string;
};

export interface EmotionsMap {
  [key: string]: EmotionEvent;
}

export enum BODY_TEXTURE_TYPE {
  BRONZE = 'BRONZE',
  CAMO = 'CAMO',
  DOTS = 'DOTS',
  SKITZ = 'SKITZ',
  WOOD0 = 'WOOD0',
  WOOD1 = 'WOOD1',
  WOOD2 = 'WOOD2',
  WOOD3 = 'WOOD3',
  WOOD4 = 'WOOD4',
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

export interface FeedbackMap {
  [interactionId: string]: Feedback;
}
