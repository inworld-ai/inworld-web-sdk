import { v4 } from 'uuid';

import {
  InworlControlAction,
  InworldPacketType,
} from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import { AudioEvent } from '../../src/entities/packets/audio.entity';
import { ControlEvent } from '../../src/entities/packets/control.entity';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { Routing } from '../../src/entities/packets/routing.entity';
import { TextEvent } from '../../src/entities/packets/text.entity';
import { agents, convertAgentsToCharacters, getPacketId } from '../helpers';

const packetId = getPacketId();
const packetIdWithCorrelation = {
  ...packetId,
  correlationId: v4(),
};
const routing: Routing = {
  source: {
    name: v4(),
    isPlayer: true,
    isCharacter: false,
  },
  targets: [
    {
      name: v4(),
      isPlayer: false,
      isCharacter: true,
    },
  ],
};
const date = protoTimestamp();

test('should get audio packet fields', () => {
  const audio = new AudioEvent({
    chunk: v4(),
  });

  const packet = new InworldPacket({
    audio,
    packetId,
    routing,
    date,
    type: InworldPacketType.AUDIO,
  });

  expect(packet.isAudio()).toEqual(true);
  expect(packet.audio).toEqual(audio);
  expect(packet.routing).toEqual(routing);
  expect(packet.date).toEqual(date);
  expect(packet.packetId).toEqual(packetId);
});

test('should get text packet fields', () => {
  const text: TextEvent = {
    text: v4(),
    final: false,
  };

  const packet = new InworldPacket({
    text,
    packetId: packetIdWithCorrelation,
    routing,
    date,
    type: InworldPacketType.TEXT,
  });

  expect(packet.isText()).toEqual(true);
  expect(packet.text).toEqual(text);
  expect(packet.routing).toEqual(routing);
  expect(packet.date).toEqual(date);
  expect(packet.packetId).toEqual(packetIdWithCorrelation);
});

test('should get trigger packet fields', () => {
  const packet = new InworldPacket({
    packetId: packetIdWithCorrelation,
    routing,
    date,
    type: InworldPacketType.TRIGGER,
  });

  expect(packet.isTrigger()).toEqual(true);
  expect(packet.routing).toEqual(routing);
  expect(packet.date).toEqual(date);
  expect(packet.packetId).toEqual(packetIdWithCorrelation);
});

test('should get emotion packet fields', () => {
  const packet = new InworldPacket({
    packetId,
    routing,
    date,
    type: InworldPacketType.EMOTION,
  });

  expect(packet.isEmotion()).toEqual(true);
  expect(packet.routing).toEqual(routing);
  expect(packet.date).toEqual(date);
  expect(packet.packetId).toEqual(packetId);
});

test('should get silence packet fields', () => {
  const packet = new InworldPacket({
    packetId,
    routing,
    date,
    silence: {
      durationMs: 100,
    },
    type: InworldPacketType.SILENCE,
  });

  expect(packet.isSilence()).toEqual(true);
  expect(packet.routing).toEqual(routing);
  expect(packet.date).toEqual(date);
  expect(packet.packetId).toEqual(packetId);
});

test('should get cancel response packet fields', () => {
  const packet = new InworldPacket({
    packetId,
    routing,
    date,
    cancelResponses: {
      interactionId: v4(),
      utteranceId: [v4(), v4()],
    },
    type: InworldPacketType.CANCEL_RESPONSE,
  });

  expect(packet.isCancelResponse()).toEqual(true);
  expect(packet.routing).toEqual(routing);
  expect(packet.date).toEqual(date);
  expect(packet.packetId).toEqual(packetId);
});

describe('scene mutation', () => {
  const characters = convertAgentsToCharacters(agents);

  test('should get scene change event request', () => {
    const name = v4();
    const packet = new InworldPacket({
      packetId,
      routing,
      date,
      type: InworldPacketType.SCENE_MUTATION_REQUEST,
      sceneMutation: { name },
    });

    expect(packet.isSceneMutationRequest()).toEqual(true);
    expect(packet.routing).toEqual(routing);
    expect(packet.date).toEqual(date);
    expect(packet.packetId).toEqual(packetId);
    expect(packet.sceneMutation.name).toEqual(name);
  });

  test('should get character add event request', () => {
    const addedCharacterNames = [v4(), v4()];
    const packet = new InworldPacket({
      packetId,
      routing,
      date,
      type: InworldPacketType.SCENE_MUTATION_REQUEST,
      sceneMutation: { addedCharacterNames },
    });

    expect(packet.isSceneMutationRequest()).toEqual(true);
    expect(packet.routing).toEqual(routing);
    expect(packet.date).toEqual(date);
    expect(packet.packetId).toEqual(packetId);
    expect(packet.sceneMutation.addedCharacterNames).toEqual(
      addedCharacterNames,
    );
  });

  test('should get scene change event response', () => {
    const packet = new InworldPacket({
      packetId,
      routing,
      date,
      type: InworldPacketType.SCENE_MUTATION_RESPONSE,
      sceneMutation: { loadedCharacters: characters },
    });

    expect(packet.isSceneMutationResponse()).toEqual(true);
    expect(packet.routing).toEqual(routing);
    expect(packet.date).toEqual(date);
    expect(packet.packetId).toEqual(packetId);
    expect(packet.sceneMutation.loadedCharacters).toEqual(characters);
  });

  test('should get character add event response', () => {
    const addedCharacterNames = characters.map((c) => c.displayName);
    const packet = new InworldPacket({
      packetId,
      routing,
      date,
      type: InworldPacketType.SCENE_MUTATION_RESPONSE,
      sceneMutation: { addedCharacterNames },
    });

    expect(packet.isSceneMutationResponse()).toEqual(true);
    expect(packet.routing).toEqual(routing);
    expect(packet.date).toEqual(date);
    expect(packet.packetId).toEqual(packetId);
    expect(packet.sceneMutation.addedCharacterNames).toEqual(
      addedCharacterNames,
    );
  });
});

describe('control', () => {
  test('should get interaction end packet fields', () => {
    const packet = new InworldPacket({
      packetId,
      routing,
      date,
      type: InworldPacketType.CONTROL,
      control: new ControlEvent({
        action: InworlControlAction.INTERACTION_END,
      }),
    });

    expect(packet.isControl()).toEqual(true);
    expect(packet.isInteractionEnd()).toEqual(true);
    expect(packet.routing).toEqual(routing);
    expect(packet.date).toEqual(date);
    expect(packet.packetId).toEqual(packetId);
  });

  test('should get warning packet fields', () => {
    const packet = new InworldPacket({
      packetId,
      routing,
      date,
      type: InworldPacketType.CONTROL,
      control: new ControlEvent({ action: InworlControlAction.WARNING }),
    });

    expect(packet.isControl()).toEqual(true);
    expect(packet.isWarning()).toEqual(true);
    expect(packet.routing).toEqual(routing);
    expect(packet.date).toEqual(date);
    expect(packet.packetId).toEqual(packetId);
  });
});
