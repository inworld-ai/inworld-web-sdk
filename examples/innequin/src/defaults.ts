import { CHAT_VIEW } from './app/types';
import { Config } from './config';

export const configuration = {
  character: { name: Config.INWORLD_CHARACTER },
  chatView: CHAT_VIEW.TEXT,
  scene: { name: Config.INWORLD_SCENE },
  player: { name: 'Participant' },
};
