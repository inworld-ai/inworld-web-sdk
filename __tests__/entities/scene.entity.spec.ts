import { v4 } from 'uuid';

import { Actor, InworldPacket as ProtoPacket } from '../../proto/packets.pb';
import {
  LoadSceneResponse,
  PreviousState as PreviousStateProto,
} from '../../proto/world-engine.pb';
import { protoTimestamp } from '../../src/common/helpers';
import { InworldPacket } from '../../src/entities/inworld_packet.entity';
import { PreviousState, Scene } from '../../src/entities/scene.entity';
import { convertAgentsToCharacters, createAgent } from '../helpers';

const key = v4();
const agents = [createAgent(), createAgent()];
const characters = convertAgentsToCharacters(agents);
const id1 = v4();
const id2 = v4();
const packet: ProtoPacket = {
  packetId: { packetId: v4() },
  routing: {
    source: {} as Actor,
    target: {} as Actor,
  },
  emotion: {},
  timestamp: protoTimestamp(),
};
const previousState: PreviousState = {
  stateHolders: [
    {
      resourceName: `workspaces/${id1}`,
      packets: [InworldPacket.fromProto(packet)],
    },
    {
      resourceName: `workspaces/${id2}`,
      packets: [InworldPacket.fromProto(packet)],
    },
  ],
};
const previousStateProto: PreviousStateProto = {
  stateHolders: [
    {
      brainName: id1,
      packets: [packet],
    },
    {
      brainName: id2,
      packets: [packet],
    },
  ],
};
const scene = new Scene({
  characters,
  key,
  previousState,
});

test('should get scene fields', () => {
  expect(scene.characters).toEqual(characters);
  expect(scene.key).toEqual(key);
});

test('should convert proto to external object', () => {
  const proto: LoadSceneResponse = {
    agents,
    key,
    previousState: previousStateProto,
  };

  expect(scene).toEqual(Scene.fromProto(proto));
});
