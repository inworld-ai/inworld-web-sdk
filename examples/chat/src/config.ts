import { Configuration } from './app/types';

export const Config: Configuration = {
  ANIMATIONS_URI:
    'https://storage.googleapis.com/assets-inworld-ai/models/innequin/models/animations/',
  DEFAULT_ANIMATION: 'Neutral_Hello_Long_01',
  GENERATE_TOKEN_URL:
    process.env.REACT_APP_GENERATE_TOKEN_URL || 'http://localhost:4000',
  IMAGES_BODY_URI: './assets/textures/body/', // https://storage.googleapis.com/assets-inworld-ai/models/innequin/textures/body/
  IMAGES_FACIAL_URI:
    'https://storage.googleapis.com/assets-inworld-ai/models/innequin/imgs/face/',
  INWORLD_CHARACTER: process.env.REACT_APP_INWORLD_CHARACTER,
  INWORLD_SCENE: process.env.REACT_APP_INWORLD_SCENE,
  MODEL_URI: './assets/innequin.glb',
  RPM_AVATAR: process.env.REACT_APP_RPM_AVATAR,
  CAMERA_SETTINGS: {
    POS_X: 0,
    POS_Y: 2,
    POS_Z: 3,
    TAR_X: 0,
    TAR_Y: 1,
    TAR_Z: 0,
    FOV: 45,
    NEAR: 0.01,
    FAR: 1000,
  },
};
