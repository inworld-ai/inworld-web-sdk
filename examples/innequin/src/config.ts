import { Configuration } from './app/types';

export const Config: Configuration = {
    ANIMATIONS_URI: '/models/animations/',
    DEFAULT_ANIMATION: 'Neutral_Hello_Long_01',
    GENERATE_TOKEN_URL:
        process.env.REACT_APP_GENERATE_TOKEN_URL || 'http://localhost:4000',
    IMAGES_BODY_URI: '/imgs/body/',
    IMAGES_FACIAL_URI: '/imgs/face/',
    INWORLD_CHARACTER: process.env.REACT_APP_INWORLD_CHARACTER,
    INWORLD_SCENE: process.env.REACT_APP_INWORLD_SCENE,
    MODEL_URI: '/models/innequin.glb',
};