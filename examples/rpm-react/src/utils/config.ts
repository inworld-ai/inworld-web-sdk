export type CameraConfiguration = {
  posX: number;
  posY: number;
  posZ: number;
  tarX: number;
  tarY: number;
  tarZ: number;
  fov: number;
  near: number;
  far: number;
};

export type RPMAssetsConfiguration = {
  baseURI: string;
  configURI: string;
  dracoURI: string;
}

export type InworldConfiguration = {
  characterId: string;
  sceneId: string;
  tokenURL: string;
}

export type Configuration = {
  camera: CameraConfiguration;
  rpm: RPMAssetsConfiguration;
  inworld: InworldConfiguration;
}

export const config: Configuration = {
  camera: {
    posX: -1,
    posY: 1.5,
    posZ: 3,
    tarX: 0,
    tarY: 1,
    tarZ: 0,
    fov: 45,
    near: 0.01,
    far: 1000,
  },
  rpm: {
    baseURI: process.env.REACT_APP_RPM_BASE_URI!,
    configURI: process.env.REACT_APP_RPM_CONFIG_URI!,
    dracoURI: process.env.REACT_APP_DRACO_COMPRESSION_URI || '',
  },
  inworld: {
    characterId: process.env.REACT_APP_INWORLD_CHARACTER_ID!,
    sceneId: process.env.REACT_APP_INWORLD_SCENE_ID!,
    tokenURL: process.env.REACT_APP_INWORLD_GENERATE_TOKEN_URL || 'http://localhost:4000'
  },

}