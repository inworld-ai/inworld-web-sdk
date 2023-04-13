import { EmotionEvent } from '@inworld/web-sdk';

export enum CHAT_VIEW {
  TEXT = 'Text',
  AVATAR = 'Avatar',
}

export type ConfigurationCharacter = {
  name?: string;
};

export type ConfigurationScene = {
  name?: string;
};

export type ConfigurationPlayer = {
  name?: string;
};

export type Configuration = {
  character?: ConfigurationCharacter;
  scene?: ConfigurationScene;
  player?: ConfigurationPlayer;
  chatView?: CHAT_VIEW;
};

export interface EmotionsMap {
  [key: string]: EmotionEvent;
}
