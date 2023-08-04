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

export enum ANIMATION_TYPE {
  IDLE = 'idle',
  GESTURE = 'gesture',
  INTRO = 'intro',
  OUTRO = 'outro',
  HELLO = 'hello',
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
  BODY_ARMS = 'body_arms',
  BODY_HEAD = 'body_head',
  BODY_LEGS = 'body_legs',
  BODY_TORSO = 'body_torso',
  BROW = 'brow',
  EYE = 'eye',
  MOUTH = 'mouth',
  NOSE = 'nose',
}

export enum TEXTURE_TYPES {
  ALPHA = 'alpha',
  COLOR = 'color',
  NORMAL = 'normal',
}
