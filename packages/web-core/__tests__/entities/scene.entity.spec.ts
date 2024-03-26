import { ActorType } from '../../proto/ai/inworld/packets/packets.pb';
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
    name: SCENE,
    loadedScene: { agents },
    sessionHistory: {
      sessionHistoryItems: [
        {
          agent: {
            agentId: agents[0].agentId,
          },
          packets: [
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
  expect(scene.characters[1].assets.avatarImg).toEqual(undefined);
  expect(scene.history.length).toEqual(2);
});

test('should convert proto to scene without history items and agents', () => {
  const proto = {
    name: SCENE,
    sessionHistory: {
      sessionHistoryItems: [{}],
    },
  };
  const scene = Scene.fromProto(proto);

  expect(scene.characters.length).toEqual(0);
  expect(scene.history.length).toEqual(0);
});
