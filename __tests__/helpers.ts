import { v4 } from 'uuid';

import { LoadSceneResponseAgent } from '../proto/world-engine.pb';
import {
  Capabilities,
  Client,
  SessionToken,
  User,
} from '../src/common/interfaces';
import { QueueItem } from '../src/connection/web-socket.connection';
import { Character } from '../src/entities/character.entity';
import { PacketId } from '../src/entities/inworld_packet.entity';
import { EventFactory } from '../src/factories/event';

const today = new Date();
today.setHours(today.getHours() + 1);

export const SCENE = v4();

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

export const createAgent = (): LoadSceneResponseAgent => {
  return {
    agentId: v4(),
    brainName: v4(),
    characterAssets: {
      rpmModelUri: v4(),
      rpmImageUriPortrait: v4(),
      rpmImageUriPosture: v4(),
    },
  };
};

export const convertAgentsToCharacters = (agents: LoadSceneResponseAgent[]) => {
  return agents.map(
    (agent: LoadSceneResponseAgent) =>
      new Character({
        id: agent.agentId,
        resourceName: agent.brainName,
        displayName: agent.givenName,
        assets: agent.characterAssets,
      }),
  );
};

export const session: SessionToken = {
  sessionId: v4(),
  token: v4(),
  type: 'Bearer',
  expirationTime: today.toISOString(),
};

export const generateSessionToken = () => Promise.resolve(session);

export const capabilitiesProps: Capabilities = {
  audio: true,
  emotions: true,
  interruptions: true,
  phonemes: true,
  silence: true,
  narratedActions: true,
  turnBasedStt: true,
};

export const user: User = {
  fullName: 'Full Name',
  id: 'id',
};

export const client: Client = {
  id: 'ClientId',
};

export const writeMock = (item: QueueItem) => {
  const packet = EventFactory.fromProto(item.getPacket());
  item.beforeWriting?.(packet);
  item.afterWriting?.(packet);
};

export const getPacketId = (): PacketId => ({
  packetId: v4(),
  interactionId: v4(),
  utteranceId: v4(),
});
