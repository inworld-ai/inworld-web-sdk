export const GRPC_HOSTNAME = 'studio.inworld.ai';
export const CLIENT_ID = 'web';
export const DEFAULT_USER_NAME = 'User';
export const DEFAULT_PLAYBACK_SAMPLE_RATE = 16000;
export const SCENE_PATTERN =
  /^workspaces\/([a-z0-9-_]{1,61})\/(characters|scenes)\/([a-z0-9-_]{1,61})$/iu;
export const CHARACTER_PATTERN =
  /^workspaces\/([a-z0-9-_]{1,61})\/characters\/([a-z0-9-_]{1,61})$/iu;

export const DEFAULT_SESSION_STATE_MAX_ATTEMPTS = 3;
export const DEFAULT_SESSION_STATE_KEY = 'inworldSessionState';
export const DEFAULT_SESSION_STATE_INTERVAL = 5 * 60 * 1000; // 5 minute
export const DEFAULT_SESSION_STATE_ATTEMPTS_INTERVAL = 1000; // 1 second
