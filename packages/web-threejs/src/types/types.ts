export type AnimationGesture = {
  duration: number;
  emotion: EMOTIONS_BODY;
  name: string;
};

export type MESH_TYPE_ID = {
  meshName: string;
  meshType: MESH_TYPES;
};

export enum ANIMATION_TYPE {
  IDLE = 'idle',
  GESTURE = 'gesture',
  INTRO = 'intro',
  OUTRO = 'outro',
  HELLO = 'hello',
  TALKING = 'talking',
}

export enum ASSET_TYPE {
  HAT = 'hat',
  HEAD = 'head',
  WINGS = 'wings',
}

export enum EMOTIONS_BODY {
  ANGRY = 'ANGRY',
  FEAR = 'FEAR',
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  SAD = 'SAD',
}

export enum EMOTIONS_FACE {
  AFFECTION = 'AFFECTION',
  ANGRY = 'ANGRY',
  FEAR = 'FEAR',
  HUMOR = 'HUMOR',
  JOY = 'JOY',
  NEUTRAL = 'NEUTRAL',
  SAD = 'SAD',
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
  VISEMES = 'visemes',
}

export enum GENDER_TYPES {
  FEMALE = 'female',
  MALE = 'male',
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

export type SkinType = {
  color: string;
  metallic: string;
  normals: string;
  roughness: string;
};

export enum TEXTURE_TYPES {
  ALPHA = 'alpha',
  COLOR = 'color',
  NORMAL = 'normal',
}
