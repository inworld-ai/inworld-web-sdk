import { Configuration } from './app/types';

export const Config: Configuration = {
  ANIMATIONS_URI: process.env.REACT_APP_ANIMATIONS_URI!,
  DEFAULT_ANIMATION: process.env.REACT_APP_DEFAULT_ANIMATION!,
  DEFAULT_SKIN: process.env.REACT_APP_DEFAULT_SKIN!,
  GENERATE_TOKEN_URL:
    process.env.REACT_APP_GENERATE_TOKEN_URL || 'http://localhost:4000',
  IMAGES_BODY_URI: process.env.REACT_APP_IMAGES_BODY_URI!,
  IMAGES_FACIAL_URI: process.env.REACT_APP_IMAGES_FACIAL_URI!,
  INWORLD_CHARACTER: process.env.REACT_APP_INWORLD_CHARACTER!,
  INWORLD_SCENE: process.env.REACT_APP_INWORLD_SCENE,
  MODEL_URI: process.env.REACT_APP_MODEL_URI!,
  RPM_AVATAR: process.env.REACT_APP_RPM_AVATAR,
  DRACO_COMPRESSION_URI: process.env.REACT_APP_DRACO_COMPRESSION_URI!,
  CAMERA_SETTINGS: {
    // Defaults
    POS_X: 0, // 0
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
