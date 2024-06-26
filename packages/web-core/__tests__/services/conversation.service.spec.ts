import '../mocks/window.mock';

import { v4 } from 'uuid';

import { ActorType } from '../../proto/ai/inworld/packets/packets.pb';
import { ConversationService } from '../../src';
import {
  AudioSessionState,
  ConversationParticipant,
  ConversationState,
  LoadedScene,
} from '../../src/common/data_structures';
import { MULTI_CHAR_NARRATED_ACTIONS } from '../../src/common/errors';
import { InworldHistory } from '../../src/components/history';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { GrpcWebRtcLoopbackBiDiSession } from '../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import { WebSocketConnection } from '../../src/connection/web-socket.connection';
import { EventFactory } from '../../src/factories/event';
import { ConnectionService } from '../../src/services/connection.service';
import {
  conversationId,
  conversationUpdated,
  convertAgentsToCharacters,
  createAgent,
  createCharacter,
  generateSessionToken,
  SCENE,
} from '../helpers';

const agents = [createAgent(), createAgent()];
const characters = convertAgentsToCharacters(agents);
const grpcAudioPlayer = new GrpcAudioPlayback();
const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();
const onHistoryChange = jest.fn();

const connection = new ConnectionService({
  config: {
    capabilities: {
      audio: true,
      emotions: true,
    },
  },
  name: SCENE,
  grpcAudioPlayer,
  webRtcLoopbackBiDiSession,
  generateSessionToken,
  onHistoryChange,
});

beforeEach(() => {
  connection.conversations.clear();

  jest
    .spyOn(connection, 'getCharactersByResourceNames')
    .mockImplementation((names: string[]) =>
      characters.filter((character) => names.includes(character.resourceName)),
    );
});

test('should create service', () => {
  const conversation = new ConversationService(connection, {
    participants: characters.map((c) => c.resourceName),
    addCharacters: jest.fn(),
  });
  const conversationCharacters = conversation.getCharacters();

  expect(conversation.getConversationId()).toBeDefined();
  expect(conversationCharacters[0].id).toBe(characters[0].id);
  expect(conversationCharacters[1].id).toBe(characters[1].id);
  expect(conversation.getHistory()).toEqual([]);
});

test('should return transcript', () => {
  const result = 'test';
  const getTranscript = jest
    .spyOn(InworldHistory.prototype, 'getTranscript')
    .mockImplementationOnce(() => result);

  const conversation = new ConversationService(connection, {
    participants: characters.map((c) => c.resourceName),
    addCharacters: jest.fn(),
  });

  const transcript = conversation.getTranscript();

  expect(getTranscript).toHaveBeenCalledTimes(1);
  expect(transcript).toEqual(result);
});

describe('update participants', () => {
  beforeEach(() => {
    connection.conversations.clear();
  });

  test('should throw error if audio session was started twice', async () => {
    jest
      .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
      .mockImplementation(() => AudioSessionState.START);

    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName],
      addCharacters: jest.fn(),
    });

    expect(async () => {
      await service.sendAudioSessionStart();
    }).rejects.toThrow('Audio session is already started');
  });

  test('should throw error if audio session was finished twice', async () => {
    jest
      .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
      .mockImplementation(() => AudioSessionState.END);

    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName],
      addCharacters: jest.fn(),
    });

    expect(async () => {
      await service.sendAudioSessionEnd();
    }).rejects.toThrow(
      'Audio session cannot be ended because it has not been started',
    );
  });

  test('should throw error if conversation is missing', async () => {
    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName],
      addCharacters: jest.fn(),
    });

    expect(
      async () =>
        await service.updateParticipants([characters[1].resourceName]),
    ).rejects.toThrow(`Conversation ${service.getConversationId()} not found`);
  });

  test('should do nothing if conversation is already in progress', async () => {
    jest.spyOn(ConnectionService.prototype, 'send').mockImplementation(() =>
      Promise.resolve({
        packetId: {
          conversationId: conversationId,
        },
      }),
    );
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);

    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName],
      addCharacters: jest.fn(),
    });

    expect(service.getCharacters()).toEqual([characters[0]]);

    connection.conversations.set(conversationId, {
      service: service,
      state: ConversationState.PROCESSING,
    });

    await service.updateParticipants([characters[1].resourceName]);

    expect(service.getCharacters()).toEqual([characters[0]]);
  });

  test('should work without errors', async () => {
    jest.spyOn(ConnectionService.prototype, 'send').mockImplementation(() =>
      Promise.resolve({
        packetId: {
          conversationId: conversationId,
        },
      }),
    );
    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({
          sceneStatus: { agents },
          sessionHistory: {
            sessionHistoryItems: [
              {
                agent: {
                  agentId: agents[0].agentId,
                },
                packets: [
                  {
                    packetId: { packetId: v4() },
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
                    packetId: { packetId: v4() },
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
        } as unknown as LoadedScene),
      );
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);
    const getAudioSessionAction = jest
      .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
      .mockImplementation(() => AudioSessionState.UNKNOWN);
    const sendAudioSessionEnd = jest
      .spyOn(ConversationService.prototype, 'sendAudioSessionEnd')
      .mockImplementation(jest.fn());
    const sendAudioSessionStart = jest
      .spyOn(ConversationService.prototype, 'sendAudioSessionStart')
      .mockImplementation(jest.fn());

    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName],
      addCharacters: jest.fn(),
    });

    expect(service.getCharacters()).toEqual([characters[0]]);

    connection.conversations.set(conversationId, {
      service: service,
      state: ConversationState.INACTIVE,
    });

    await Promise.all([
      service.updateParticipants([characters[1].resourceName]),
      new Promise((resolve: any) => {
        setTimeout(() => {
          connection.conversations.set(conversationId, {
            service: service,
            state: ConversationState.ACTIVE,
          });
          resolve();
        }, 0);
      }),
    ]);

    expect(service.getCharacters()).toEqual([characters[1]]);
    expect(getAudioSessionAction).toHaveBeenCalledTimes(1);
    expect(sendAudioSessionEnd).toHaveBeenCalledTimes(0);
    expect(sendAudioSessionStart).toHaveBeenCalledTimes(0);
  });

  test('should reopen audio session', async () => {
    jest.spyOn(ConnectionService.prototype, 'send').mockImplementation(() =>
      Promise.resolve({
        packetId: {
          conversationId: conversationId,
        },
      }),
    );
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);

    const getAudioSessionAction = jest
      .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
      .mockImplementation(() => AudioSessionState.START);
    const sendAudioSessionEnd = jest
      .spyOn(ConversationService.prototype, 'sendAudioSessionEnd')
      .mockImplementation(jest.fn());
    const sendAudioSessionStart = jest
      .spyOn(ConversationService.prototype, 'sendAudioSessionStart')
      .mockImplementation(jest.fn());

    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName],
      addCharacters: jest.fn(),
    });

    expect(service.getCharacters()).toEqual([characters[0]]);

    connection.conversations.set(conversationId, {
      service: service,
      state: ConversationState.INACTIVE,
    });

    await Promise.all([
      service.updateParticipants([characters[1].resourceName]),
      new Promise((resolve: any) => {
        setTimeout(() => {
          connection.conversations.set(conversationId, {
            service: service,
            state: ConversationState.ACTIVE,
          });
          resolve();
        }, 0);
      }),
    ]);

    expect(getAudioSessionAction).toHaveBeenCalledTimes(1);
    expect(sendAudioSessionEnd).toHaveBeenCalledTimes(1);
    expect(sendAudioSessionStart).toHaveBeenCalledTimes(1);
  });

  test('should add characters to scene automatically', async () => {
    jest.spyOn(ConnectionService.prototype, 'send').mockImplementation(() =>
      Promise.resolve({
        packetId: {
          conversationId: conversationId,
        },
      }),
    );
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);

    const newCharacter = createCharacter();
    const addCharacters = jest.fn();
    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName, ConversationParticipant.USER],
      addCharacters,
    });

    expect(service.getCharacters()).toEqual([characters[0]]);

    connection.conversations.set(conversationId, {
      service: service,
      state: ConversationState.INACTIVE,
    });

    await Promise.all([
      service.updateParticipants([
        characters[0].resourceName,
        newCharacter.resourceName,
        ConversationParticipant.USER,
      ]),
      new Promise((resolve: any) => {
        setTimeout(() => {
          connection.conversations.set(conversationId, {
            service: service,
            state: ConversationState.ACTIVE,
          });
          resolve();
        }, 0);
      }),
    ]);

    expect(addCharacters).toHaveBeenCalledTimes(1);
  });
});

describe('send', () => {
  test('should throw error if conversation is missing', async () => {
    const service = new ConversationService(connection, {
      participants: [characters[0].resourceName],
      addCharacters: jest.fn(),
    });

    expect(async () => await service.sendText(v4())).rejects.toThrow(
      `Conversation ${service.getConversationId()} not found`,
    );
  });

  test('should throw error if narrated action is sent for multi-agents', async () => {
    const service = new ConversationService(connection, {
      participants: characters.map((c) => c.resourceName),
      addCharacters: jest.fn(),
    });

    connection.conversations.set(conversationId, {
      service: service,
      state: ConversationState.ACTIVE,
    });

    expect(async () => {
      await service.sendNarratedAction(v4());
    }).rejects.toThrow(MULTI_CHAR_NARRATED_ACTIONS);
  });

  test('should skip cancel response sending for multi-agent', async () => {
    const cancelResponse = jest.spyOn(EventFactory.prototype, 'cancelResponse');

    const service = new ConversationService(connection, {
      participants: characters.map((c) => c.resourceName),
      addCharacters: jest.fn(),
    });

    connection.conversations.set(conversationId, {
      service: service,
      state: ConversationState.ACTIVE,
    });

    await service.sendCancelResponse();

    expect(cancelResponse).toHaveBeenCalledTimes(0);
  });

  test('should keep packages in queue until conversation is active', async () => {
    const send = jest
      .spyOn(ConnectionService.prototype, 'send')
      .mockImplementation(() =>
        Promise.resolve({
          packetId: {
            conversationId: conversationId,
          },
        }),
      );
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);

    const service = new ConversationService(connection, {
      participants: characters.map((c) => c.resourceName),
      addCharacters: jest.fn(),
    });

    connection.conversations.set(conversationId, {
      service: service,
      state: ConversationState.INACTIVE,
    });

    await Promise.all([
      Promise.all([service.sendText(v4()), service.sendText(v4())]),
      new Promise((resolve: any) => {
        setTimeout(() => {
          expect(connection.conversations.get(conversationId)?.state).toEqual(
            ConversationState.PROCESSING,
          );
          connection.onMessage!(conversationUpdated);
          connection.conversations.set(conversationId, {
            service: service,
            state: ConversationState.ACTIVE,
          });
          resolve();
        }, 0);
      }),
    ]);

    expect(connection.conversations.get(conversationId)?.state).toEqual(
      ConversationState.ACTIVE,
    );
    expect(send).toHaveBeenCalledTimes(3);
  });
});
