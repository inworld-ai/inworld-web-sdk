import { WS } from 'jest-websocket-mock';
import { v4 } from 'uuid';

import {
  Agent,
  ControlEventAction,
} from '../../proto/ai/inworld/packets/packets.pb';
import { Capabilities, Client, User } from '../../src/common/data_structures';
import { Character } from '../../src/entities/character.entity';
import {
  DialogParticipant,
  DialogPhrase,
  PreviousDialog,
} from '../../src/entities/continuation/previous_dialog.entity';

export const SCENE = `workspaces/${v4()}/characters/${v4()}`;

export const capabilitiesProps: Capabilities = {
  audio: true,
  debugInfo: true,
  emotions: true,
  interruptions: true,
  phonemes: true,
  silence: true,
  narratedActions: true,
};

export const user: User = {
  fullName: 'Full Name',
  id: 'id',
  profile: { fields: [{ id: 'field_1', value: 'value_1' }] },
};

export const client: Client = {
  id: 'ClientId',
};

export const phrases: DialogPhrase[] = [
  {
    talker: DialogParticipant.CHARACTER,
    phrase: v4(),
  },
  {
    talker: DialogParticipant.PLAYER,
    phrase: v4(),
  },
  {
    talker: DialogParticipant.UNKNOWN,
    phrase: v4(),
  },
];
export const previousDialog = new PreviousDialog(phrases);
export const previousState = v4();
export const previousStateUint8Array = previousState as unknown as Uint8Array;

export const createCharacter = () =>
  new Character({
    id: v4(),
    resourceName: v4(),
    displayName: v4(),
    assets: {
      rpmModelUri: v4(),
      rpmImageUriPortrait: v4(),
      rpmImageUriPosture: v4(),
    },
  });

export const createAgent = (): Agent => {
  return {
    agentId: v4(),
    brainName: `workspaces/${v4()}/characters/${v4()}`,
    givenName: v4(),
    characterAssets: {
      avatarImg: v4(),
      avatarImgOriginal: v4(),
      rpmModelUri: v4(),
      rpmImageUriPortrait: v4(),
      rpmImageUriPosture: v4(),
    },
  };
};

export const convertAgentsToCharacters = (agents: Agent[]) => {
  return agents.map(
    (agent: Agent) =>
      new Character({
        id: agent.agentId!,
        resourceName: agent.brainName!,
        displayName: agent.givenName!,
        assets: agent.characterAssets!,
      }),
  );
};

export const agents = [createAgent(), createAgent()];

export const historyResponseEvent = {
  sessionHistory: {
    sessionHistoryItems: agents.map((agent) => ({
      agent,
      packets: [
        {
          routing: {
            target: {},
            source: {},
          },
        },
        {
          routing: {
            target: {},
            source: {},
          },
        },
      ],
    })),
  },
};

export const emitSceneStatusEvent =
  (stream: WS, sceneName?: string) => (resolve: any) => {
    stream.send({
      result: {
        control: {
          action: ControlEventAction.CURRENT_SCENE_STATUS,
          currentSceneStatus: { agents, sceneName: sceneName ?? SCENE },
        },
      },
    });
    resolve(true);
  };

export const emitHistoryResponseEvent = (stream: WS) => (resolve: any) => {
  stream.send({
    result: { sessionControlResponse: historyResponseEvent },
  });
  resolve(true);
};
