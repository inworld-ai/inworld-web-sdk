import { v4 } from 'uuid';

import { ActorType } from '../../proto/ai/inworld/packets/packets.pb';
import { LoadedScene } from '../../src/common/data_structures';
import { Character } from '../../src/entities/character.entity';
import { Scene } from '../../src/entities/scene.entity';
import { createAgent, createCharacter, SCENE } from '../helpers';

let characters: Array<Character> = [];
let scene: Scene;

beforeEach(() => {
  jest.clearAllMocks();

  characters = [createCharacter(), createCharacter()];
  scene = new Scene({ name: SCENE, characters });
});

test('should return scene fields', () => {
  expect(scene.characters).toEqual(characters);
});

test('should convert proto to scene', () => {
  const agents = [createAgent(), createAgent()];

  const proto = {
    sceneStatus: {
      sceneName: SCENE,
      agents,
    },
    sessionHistory: {
      sessionHistoryItems: [
        {
          agent: {
            agentId: agents[0].agentId,
          },
          packets: [
            {
              routing: {
                targets: [
                  {
                    type: ActorType.AGENT,
                  },
                ],
                source: {
                  type: ActorType.PLAYER,
                },
              },
            },
            {
              routing: {
                target: {
                  type: ActorType.AGENT,
                },
                source: {
                  type: ActorType.PLAYER,
                },
              },
            },
            {
              routing: {
                target: {
                  type: ActorType.PLAYER,
                },
                source: {
                  type: ActorType.AGENT,
                },
              },
            },
          ],
        },
      ],
    },
  };
  const scene = Scene.fromProto(proto);

  expect(scene.characters[0].id).toEqual(agents[0].agentId);
  expect(scene.characters[1].id).toEqual(agents[1].agentId);
  expect(scene.history.length).toEqual(3);
  expect(scene.history[0].routing!.targets![0].name).toEqual(agents[0].agentId);
  expect(scene.history[1].routing!.target!.name).toEqual(agents[0].agentId);
});

test('should convert proto to scene with empty agentId', () => {
  const agents = [createAgent(), createAgent()];

  const proto = {
    sceneStatus: { name: SCENE, agents },
    sessionHistory: {
      sessionHistoryItems: [
        {
          packets: [
            {
              routing: {
                targets: [
                  {
                    type: ActorType.AGENT,
                  },
                ],
                source: {
                  type: ActorType.PLAYER,
                },
              },
            },
            {
              routing: {
                target: {
                  type: ActorType.AGENT,
                },
                source: {
                  type: ActorType.PLAYER,
                },
              },
            },
            {
              routing: {
                target: {
                  type: ActorType.PLAYER,
                },
                source: {
                  type: ActorType.AGENT,
                },
              },
            },
          ],
        },
      ],
    },
  } as LoadedScene;
  const scene = Scene.fromProto(proto);

  expect(scene.characters[0].id).toEqual(agents[0].agentId);
  expect(scene.characters[1].id).toEqual(agents[1].agentId);
  expect(scene.history.length).toEqual(3);
  expect(scene.history[0].routing!.targets![0].name).toBeUndefined();
  expect(scene.history[1].routing!.target!.name).toBeUndefined();
});

test('should convert proto to scene without history items and agents', () => {
  const proto = {
    sceneStatus: {
      sceneName: SCENE,
    },
    sessionHistory: {
      sessionHistoryItems: [{}],
    },
  };
  const scene = Scene.fromProto(proto);

  expect(scene.characters.length).toEqual(0);
  expect(scene.history.length).toEqual(0);
});

test('should find character by id', () => {
  const [character] = scene.getCharactersByIds([characters[0].id]);

  expect(character).toEqual(characters[0]);
});

test('should return undefined when character not found', () => {
  const [character] = scene.getCharactersByIds([v4()]);

  expect(character).toBeUndefined();
});

test('should find character by resource name', () => {
  const [character] = scene.getCharactersByResourceNames([
    characters[0].resourceName,
  ]);

  expect(character).toEqual(characters[0]);
});

test('should return undefined when character not found by resource name', () => {
  const [character] = scene.getCharactersByResourceNames([v4()]);

  expect(character).toBeUndefined();
});
