import { DialogParticipant } from '@inworld/web-core';

import { CHAT_VIEW } from './app/types';
import { Config } from './config';

export const configuration = {
  character: { name: Config.INWORLD_CHARACTER },
  chatView: CHAT_VIEW.TEXT,
  scene: { name: Config.INWORLD_SCENE },
  player: { name: 'Participant' },
  continuation: {
    enabled: false,
    previousDialog: JSON.stringify([
      {
        talker: DialogParticipant.PLAYER,
        phrase: 'Hi!',
      },
      {
        talker: DialogParticipant.CHARACTER,
        phrase: 'Hi! Nice to meet you.',
      },
    ]),
  },
};

export const DEFAULT_RPM_AVATAR =
  'https://assets.inworld.ai/models/Default.glb';

export const INWORLD_SESSION_STATE_KEY = 'inworldSessionState';
