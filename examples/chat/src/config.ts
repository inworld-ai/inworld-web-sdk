import { Configuration } from './app/types';

export const Config: Configuration = {
  ANIMATIONS_URI:
    'https://storage.googleapis.com/assets-inworld-ai/models/innequin/v2/models/animations/emotions/',
  DEFAULT_ANIMATION: 'Neutral_Hello_Long_01',
  GENERATE_TOKEN_URL:
    process.env.REACT_APP_GENERATE_TOKEN_URL || 'http://localhost:4000',
  IMAGES_BODY_URI:
    'https://storage.googleapis.com/assets-inworld-ai/models/innequin/v2/textures/body/', // ./assets/textures/body/
  IMAGES_FACIAL_URI:
    'https://storage.googleapis.com/assets-inworld-ai/models/innequin/v2/textures/face/emotions/',
  INWORLD_CHARACTER: process.env.REACT_APP_INWORLD_CHARACTER,
  INWORLD_SCENE: process.env.REACT_APP_INWORLD_SCENE,
  MODEL_URI:
    'https://storage.googleapis.com/assets-inworld-ai/models/innequin/v2/models/body/innequin.glb', // ./assets/innequin.glb
  RPM_AVATAR: process.env.REACT_APP_RPM_AVATAR,
  DRACO_COMPRESSION_URI:
    'https://storage.googleapis.com/assets-inworld-ai/models/innequin/v2/draco-gltf/',
  CAMERA_SETTINGS: {
    POS_X: 0, // 0 Defaults
    POS_Y: 2, // 2
    POS_Z: 3, // 3
    TAR_X: 0, // 0
    TAR_Y: 1, // 1
    TAR_Z: 0, // 0
    FOV: 45,
    NEAR: 0.01,
    FAR: 1000,
  },
};
