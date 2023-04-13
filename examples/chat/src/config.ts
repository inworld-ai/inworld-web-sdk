export const config = {
  INWORLD_CHARACTER: process.env.REACT_APP_INWORLD_CHARACTER,
  INWORLD_SCENE: process.env.REACT_APP_INWORLD_SCENE,
  RPM_AVATAR: process.env.REACT_APP_RPM_AVATAR,
  GENERATE_TOKEN_URL:
    process.env.REACT_APP_GENERATE_TOKEN_URL || 'http://localhost:4000',
};
