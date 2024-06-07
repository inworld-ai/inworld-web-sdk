import '../mocks/window.mock';

import WS from 'jest-websocket-mock';
import { v4 } from 'uuid';

import {
  ActorType,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  TextEventSourceType,
} from '../../proto/ai/inworld/packets/packets.pb';
import { ConversationService } from '../../src';
import {
  ConversationState,
  HistoryChangedProps,
  LoadedScene,
} from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import {
  CHAT_HISTORY_TYPE,
  HistoryItem,
  InworldHistory,
} from '../../src/components/history';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { GrpcWebRtcLoopbackBiDiSession } from '../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import { Player } from '../../src/components/sound/player';
import { WebSocketConnection } from '../../src/connection/web-socket.connection';
import { Character } from '../../src/entities/character.entity';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { Actor } from '../../src/entities/packets/routing.entity';
import { SessionToken } from '../../src/entities/session_token.entity';
import { EventFactory } from '../../src/factories/event';
import { ConnectionService } from '../../src/services/connection.service';
import {
  SessionState,
  StateSerializationService,
} from '../../src/services/pb/state_serialization.service';
import {
  capabilitiesProps,
  conversationId,
  convertAgentsToCharacters,
  convertPacketFromProto,
  createAgent,
  emitSceneStatusEvent,
  generateSessionToken,
  previousState,
  SCENE,
  session,
  user,
  writeMock,
} from '../helpers';

const onError = jest.fn();
const onMessage = jest.fn();
const onDisconnect = jest.fn();
const onInterruption = jest.fn();
const agents = [createAgent(), createAgent()];
const characters = convertAgentsToCharacters(agents);
const grpcAudioPlayer = new GrpcAudioPlayback();
const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();
const eventFactory = new EventFactory();
eventFactory.setCurrentCharacter(characters[0]);

const textEvent: ProtoPacket = {
  packetId: {
    packetId: v4(),
    interactionId: v4(),
    utteranceId: v4(),
    correlationId: v4(),
  },
  routing: {
    source: { type: ActorType.PLAYER },
    target: { type: ActorType.AGENT, name: characters[0].id },
  },
  text: {
    sourceType: TextEventSourceType.TYPED_IN,
    text: v4(),
    final: true,
  },
  timestamp: protoTimestamp(),
};
const audioEvent = eventFactory.dataChunk(v4(), DataChunkDataType.AUDIO, {
  conversationId,
});
const warningEvent: ProtoPacket = {
  packetId: {
    ...textEvent.packetId,
    utteranceId: v4(),
  },
  routing: {
    source: {
      name: v4(),
      type: ActorType.AGENT,
    },
    targets: [
      {
        name: characters[0].id,
        type: ActorType.PLAYER,
      },
    ],
  },
  control: {
    action: ControlEventAction.WARNING,
    description: v4(),
  },
};
const incomingTextEvent: ProtoPacket = {
  packetId: {
    ...textEvent.packetId,
    utteranceId: v4(),
  },
  routing: {
    source: {
      name: v4(),
      type: ActorType.AGENT,
    },
    targets: [
      {
        name: characters[0].id,
        type: ActorType.PLAYER,
      },
    ],
  },
  text: {
    text: v4(),
    final: false,
  },
};

test('should return event factory', () => {
  const connection = new ConnectionService();

  expect(connection.getEventFactory()).toBeInstanceOf(EventFactory);
});

test('should close', async () => {
  const close = jest
    .spyOn(WebSocketConnection.prototype, 'close')
    .mockImplementationOnce(jest.fn());

  jest
    .spyOn(WebSocketConnection.prototype, 'openSession')
    .mockImplementationOnce(jest.fn());

  const connection = new ConnectionService({
    name: SCENE,
    config: {
      connection: { autoReconnect: false },
      capabilities: capabilitiesProps,
    },
    user,
    onReady: () => {
      expect(connection.isActive()).toEqual(true);

      connection.close();

      expect(connection.isActive()).toEqual(false);
      expect(close).toHaveBeenCalledTimes(1);
      expect(onDisconnect).toHaveBeenCalledTimes(1);
    },
    onError,
    onMessage,
    onDisconnect,
    grpcAudioPlayer,
    generateSessionToken,
    webRtcLoopbackBiDiSession,
  });

  await connection.open();
});

test('should set and get current audio conversation', () => {
  const connection = new ConnectionService();
  const conversation = new ConversationService(connection, {
    participants: characters.map((c) => c.resourceName),
    addCharacters: jest.fn(),
  });

  connection.setCurrentAudioConversation(conversation);

  expect(connection.getCurrentAudioConversation()).toEqual(conversation);
});

test('should set and get current character', async () => {
  jest
    .spyOn(ConnectionService.prototype, 'open')
    .mockImplementationOnce(jest.fn());

  const connection = new ConnectionService();
  const character = characters[0];

  connection.setCurrentCharacter(character);

  expect(await connection.getCurrentCharacter()).toEqual(character);
});

describe('history', () => {
  let connection: ConnectionService;

  beforeEach(() => {
    connection = new ConnectionService();
  });

  test('should get history', () => {
    const get = jest
      .spyOn(InworldHistory.prototype, 'get')
      .mockImplementationOnce(jest.fn());

    connection.getHistory();

    expect(get).toHaveBeenCalledTimes(1);
  });

  test('should clear history', () => {
    const clear = jest
      .spyOn(InworldHistory.prototype, 'clear')
      .mockImplementationOnce(jest.fn());

    connection.clearHistory();

    expect(clear).toHaveBeenCalledTimes(1);
  });

  test('should return transcript', () => {
    const result = 'test';
    const getTranscript = jest
      .spyOn(InworldHistory.prototype, 'getTranscript')
      .mockImplementationOnce(() => result);

    const transcript = connection.getTranscript();

    expect(getTranscript).toHaveBeenCalledTimes(1);
    expect(transcript).toEqual(result);
  });
});

describe('getSessionState', () => {
  let connection: ConnectionService;
  let generateSessionToken: jest.Mock;

  beforeEach(() => {
    generateSessionToken = jest.fn(() => Promise.resolve(session));
    connection = new ConnectionService({
      name: SCENE,
      onError,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });
  });

  test('should get state', async () => {
    const expected: SessionState = {
      state: previousState,
      creationTime: protoTimestamp(),
    };
    const getSessionState = jest
      .spyOn(StateSerializationService.prototype, 'getSessionState')
      .mockImplementationOnce(() => Promise.resolve(expected));

    const result = await connection.getSessionState();

    expect(generateSessionToken).toHaveBeenCalledTimes(1);
    expect(getSessionState).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expected);
  });

  test('should catch error and pass it to handler', async () => {
    const err = new Error();
    const getSessionState = jest
      .spyOn(StateSerializationService.prototype, 'getSessionState')
      .mockImplementationOnce(() => {
        throw err;
      });

    await connection.getSessionState();

    expect(generateSessionToken).toHaveBeenCalledTimes(1);
    expect(getSessionState).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(err);
  });
});

describe('open', () => {
  let connection: ConnectionService;

  beforeEach(() => {
    connection = new ConnectionService({
      name: SCENE,
      config: { capabilities: capabilitiesProps },
      user,
      onError,
      onMessage,
      onDisconnect,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    jest.spyOn(Player.prototype, 'setStream').mockImplementation(jest.fn());
  });

  test('should execute without errors123', async () => {
    const openSession = jest
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
    const setCharacters = jest.spyOn(EventFactory.prototype, 'setCharacters');

    await connection.open();

    await connection.getCharacters();
    eventFactory.getCharacters();

    expect(openSession).toHaveBeenCalledTimes(1);
    expect(setCharacters).toHaveBeenCalledTimes(1);
    expect(setCharacters).toHaveBeenCalledWith(characters);
  });

  test('should catch error on load scene and pass it to handler', async () => {
    const err = new Error();
    const openSession = jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() => Promise.reject(err));

    await connection.open();

    expect(openSession).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(err);
  });

  test('should catch error on connection establishing and pass it to handler', async () => {
    const err = new Error();
    const openSession = jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() => Promise.reject(err));

    await connection.open();

    expect(openSession).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(err);
  });

  test('should not generate actual token twice', async () => {
    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
      );

    const generateSessionToken = jest.fn(() => Promise.resolve(session));

    const connection = new ConnectionService({
      name: SCENE,
      config: { capabilities: capabilitiesProps },
      user,
      onError,
      onMessage,
      onDisconnect,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    await connection.open();
    await connection.open();

    expect(generateSessionToken).toHaveBeenCalledTimes(1);
  });

  test('should regenerate expired token', async () => {
    const expiredSession: SessionToken = {
      sessionId: v4(),
      token: v4(),
      type: 'Bearer',
      expirationTime: protoTimestamp(),
    };

    const generateSessionToken = jest.fn(() => Promise.resolve(expiredSession));

    const connection = new ConnectionService({
      name: SCENE,
      config: { capabilities: capabilitiesProps },
      user,
      onError,
      onMessage,
      onDisconnect,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
      );

    await connection.open();

    connection.close();

    await connection.open();

    expect(generateSessionToken).toHaveBeenCalledTimes(2);
  });
});

describe('open manually', () => {
  let connection: ConnectionService;

  beforeEach(() => {
    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { autoReconnect: false, gateway: { hostname: '' } },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });
    jest.spyOn(Player.prototype, 'setStream').mockImplementation(jest.fn());
  });

  test('should throw error in case of openManually call without autoreconnect', async () => {
    connection = new ConnectionService({
      name: SCENE,
      config: { capabilities: capabilitiesProps },
      user,
      onError,
      onMessage,
      onDisconnect,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    await connection.openManually();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toEqual(
      'Impossible to open connection manually with `autoReconnect` enabled',
    );
  });

  test('should throw error in case openManually call with active connection', async () => {
    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
      );

    await connection.openManually();
    await connection.openManually();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toEqual(
      'Connection is already open',
    );
  });

  test('should open connection', async () => {
    const open = jest
      .spyOn(ConnectionService.prototype, 'open')
      .mockImplementationOnce(jest.fn());

    await connection.openManually();

    expect(open).toHaveBeenCalledTimes(1);
  });

  test('should add previous state packets to history', async () => {
    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({
          sceneStatus: { agents },
          sessionHistory: {
            sessionHistoryItems: [incomingTextEvent],
          },
        } as LoadedScene),
      );

    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { autoReconnect: false, gateway: { hostname: '' } },
        capabilities: capabilitiesProps,
        history: { previousState: true },
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      onHistoryChange: (history: HistoryItem[], props: HistoryChangedProps) => {
        const result = [convertPacketFromProto(incomingTextEvent)];

        expect(props.diff).toEqual(result);
        expect(history).toEqual(result);
      },
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    await connection.openManually();
  });
});

describe('send', () => {
  let server: WS;
  const HOSTNAME = 'localhost:1234';

  let connection: ConnectionService;

  const onHistoryChange = jest.fn();

  beforeEach(() => {
    server = new WS(`ws://${HOSTNAME}/v1/session/open`, {
      jsonProtocol: true,
    });

    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: '' } },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      onInterruption,
      onHistoryChange,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    jest.spyOn(Player.prototype, 'setStream').mockImplementation(jest.fn());
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);
  });

  afterEach(() => {
    server.close();
    WS.clean();
    connection.close();
  });

  test('should throw error in case of connection is inactive on send call', async () => {
    const connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: '' }, autoReconnect: false },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      onHistoryChange,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });
    const isActive = jest
      .spyOn(connection, 'isActive')
      .mockImplementationOnce(() => false);
    const open = jest.spyOn(ConnectionService.prototype, 'open');

    await connection.send(() => ({}));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toEqual(
      'Unable to send data due inactive connection',
    );
    expect(isActive).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(0);
  });

  test('should send textEvent without errors', async () => {
    const open = jest.spyOn(ConnectionService.prototype, 'open');
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementationOnce(writeMock);
    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
      );

    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: '' } },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      onHistoryChange: (history: HistoryItem[]) => {
        expect(history).toEqual([
          {
            id: textEvent.packetId.utteranceId,
            character: expect.anything(),
            characters: [characters[0]],
            correlationId: textEvent.packetId.correlationId,
            date: new Date(textEvent.timestamp),
            interactionId: textEvent.packetId.interactionId,
            isRecognizing: false,
            source: new Actor({
              isCharacter: false,
              isPlayer: true,
              name: '',
            }),
            scene: SCENE,
            text: textEvent.text.text,
            type: CHAT_HISTORY_TYPE.ACTOR,
            fromHistory: false,
          },
        ]);
      },
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    await Promise.all([
      connection.send(() => textEvent),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    expect(open).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1);
  });

  test('should interrupt on text sending', async () => {
    const interactionId = v4();
    const utteranceId = v4();
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);
    const cancelResponse = jest.spyOn(EventFactory.prototype, 'cancelResponse');
    const open = jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
      );
    jest
      .spyOn(EventFactory.prototype, 'getCurrentCharacter')
      .mockReturnValueOnce(characters[0]);
    jest
      .spyOn(GrpcAudioPlayback.prototype, 'excludeCurrentInteractionPackets')
      .mockImplementationOnce(() => [
        InworldPacket.fromProto({
          ...audioEvent,
          packetId: {
            packetId: audioEvent.packetId!.packetId,
            interactionId,
            utteranceId,
            conversationId,
          },
        }),
      ]);

    connection.conversations.set(conversationId, {
      service: new ConversationService(connection, {
        participants: [characters[0].resourceName],
        conversationId,
        addCharacters: jest.fn(),
      }),
      state: ConversationState.ACTIVE,
    });
    jest
      .spyOn(connection, 'getCharactersByResourceNames')
      .mockImplementation((names: string[]) =>
        characters.filter((character) =>
          names.includes(character.resourceName),
        ),
      );

    await Promise.all([
      connection.send(() => textEvent),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    expect(open).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(2);
    expect(cancelResponse).toHaveBeenCalledTimes(1);
    expect(onInterruption).toHaveBeenCalledTimes(1);
    expect(onInterruption).toHaveBeenCalledWith({
      interactionId,
      utteranceId: [utteranceId],
    });
  });
});

describe('onMessage', () => {
  let server: WS;
  let connection: ConnectionService;

  const HOSTNAME = 'localhost:1235';

  beforeEach(() => {
    server = new WS(`ws://${HOSTNAME}/v1/session/open`, {
      jsonProtocol: true,
    });

    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: HOSTNAME }, autoReconnect: false },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      onInterruption,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    jest
      .spyOn(GrpcAudioPlayback.prototype, 'getPlaybackStream')
      .mockImplementation(jest.fn());
    jest
      .spyOn(
        GrpcWebRtcLoopbackBiDiSession.prototype,
        'getPlaybackLoopbackStream',
      )
      .mockImplementation(jest.fn());
    jest
      .spyOn(GrpcWebRtcLoopbackBiDiSession.prototype, 'startSession')
      .mockImplementation(jest.fn());
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    server.close();
    WS.clean();
    connection.close();
  });

  test('should cancel responses for already interrupted interaction', async () => {
    const cancelResponse = jest.spyOn(EventFactory.prototype, 'cancelResponse');
    jest
      .spyOn(GrpcAudioPlayback.prototype, 'excludeCurrentInteractionPackets')
      .mockImplementationOnce(() => [
        InworldPacket.fromProto({
          ...audioEvent,
          packetId: {
            ...textEvent.packetId,
            conversationId,
          },
        }),
      ]);
    jest.spyOn(connection, 'isActive').mockImplementation(() => true);
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);

    connection.conversations.set(conversationId, {
      service: new ConversationService(connection, {
        participants: [characters[0].resourceName],
        conversationId,
        addCharacters: jest.fn(),
      }),
      state: ConversationState.ACTIVE,
    });

    jest
      .spyOn(connection, 'getCharactersByResourceNames')
      .mockImplementation((names: string[]) =>
        characters.filter((character) =>
          names.includes(character.resourceName),
        ),
      );

    await Promise.all([
      connection.open(),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);
    await server.connected;

    await connection.send(() => textEvent);

    server.send({
      result: {
        ...incomingTextEvent,
        packetId: {
          ...incomingTextEvent.packetId,
          conversationId,
        },
      },
    });

    expect(cancelResponse).toHaveBeenCalledTimes(2);
  });

  test('should interrupt on player text event', async () => {
    const cancelResponse = jest
      .spyOn(EventFactory.prototype, 'cancelResponse')
      .mockImplementationOnce(jest.fn());
    jest
      .spyOn(GrpcAudioPlayback.prototype, 'excludeCurrentInteractionPackets')
      .mockImplementationOnce(() => [
        InworldPacket.fromProto({
          ...audioEvent,
          packetId: {
            ...textEvent.packetId,
          },
        }),
      ]);

    await Promise.all([
      connection.open(),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);
    await server.connected;

    server.send({ result: incomingTextEvent });

    expect(cancelResponse).toHaveBeenCalledTimes(0);
  });

  test('should display history on incoming audio event', async () => {
    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: HOSTNAME }, autoReconnect: false },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      onHistoryChange: () => {
        expect(onMessage).toHaveBeenCalledTimes(1);
      },
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    jest
      .spyOn(InworldHistory.prototype, 'display')
      .mockImplementationOnce(() => [{} as HistoryItem, {} as HistoryItem]);
    jest
      .spyOn(InworldHistory.prototype, 'addOrUpdate')
      .mockImplementationOnce(() => []);

    await Promise.all([
      connection.open(),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);
    await server.connected;

    server.send({ result: audioEvent });
  });

  test('should propagate warning to corresponding callback', async () => {
    const onWarning = jest.fn();
    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: HOSTNAME }, autoReconnect: false },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onWarning,
      onDisconnect,
      onHistoryChange: () => {
        expect(onWarning).toHaveBeenCalledTimes(1);
        expect(onWarning).toHaveBeenCalledWith(
          InworldPacket.fromProto(warningEvent),
        );
      },
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    jest
      .spyOn(InworldHistory.prototype, 'display')
      .mockImplementationOnce(() => [{} as HistoryItem, {} as HistoryItem]);
    jest
      .spyOn(InworldHistory.prototype, 'addOrUpdate')
      .mockImplementationOnce(() => []);

    await Promise.all([
      connection.open(),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    server.send({ result: warningEvent });
    server.send({ result: audioEvent });
  });

  test('should replace scene characters', async () => {
    const newAgents = [createAgent(), createAgent()];
    let currentCharacters: Character[];

    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: HOSTNAME }, autoReconnect: false },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage: async (packet) => {
        const newCharacters = await connection.getCharacters();

        expect(packet.isSceneMutationResponse()).toEqual(true);
        expect(newCharacters[0].id).not.toBe(currentCharacters[0].id);
        expect(newCharacters[1].id).not.toBe(currentCharacters[1].id);
        expect(newCharacters[0].id).toEqual(newAgents[0].agentId);
        expect(newCharacters[1].id).toEqual(newAgents[1].agentId);
      },
      onDisconnect,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    await Promise.all([
      connection.open(),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);
    await server.connected;

    currentCharacters = await connection.getCharacters();

    const packet: ProtoPacket = {
      packetId: {
        ...textEvent.packetId,
        utteranceId: v4(),
      },
      routing: {
        source: {
          name: v4(),
          type: ActorType.AGENT,
        },
        targets: [
          {
            name: characters[0].id,
            type: ActorType.PLAYER,
          },
        ],
      },
      control: {
        action: ControlEventAction.CURRENT_SCENE_STATUS,
        currentSceneStatus: { agents: newAgents },
      },
    };

    server.send({ result: packet });
  });
});

describe('onDisconnect', () => {
  test('should inactivate conversations', async () => {
    const connection = new ConnectionService();
    const conversationId1 = v4();
    const conversationId2 = v4();

    connection.conversations.set(conversationId1, {
      service: new ConversationService(connection, {
        participants: characters.map((character) => character.resourceName),
        conversationId: conversationId1,
        addCharacters: jest.fn(),
      }),
      state: ConversationState.ACTIVE,
    });
    connection.conversations.set(conversationId2, {
      service: new ConversationService(connection, {
        participants: characters.map((character) => character.resourceName),
        conversationId: conversationId2,
        addCharacters: jest.fn(),
      }),
      state: ConversationState.PROCESSING,
    });

    await connection.onDisconnect();

    expect(connection.conversations.get(conversationId1)?.state).toEqual(
      ConversationState.INACTIVE,
    );
    expect(connection.conversations.get(conversationId2)?.state).toEqual(
      ConversationState.INACTIVE,
    );
  });
});

describe('onWarning', () => {
  test('should use console.warn by default', () => {
    const connection = new ConnectionService();
    const description = v4();

    jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn());

    connection.onWarning({ control: { description } } as InworldPacket);

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test('should print nothing if control is empty', () => {
    const connection = new ConnectionService();

    jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn());

    connection.onWarning({} as InworldPacket);

    expect(console.warn).toHaveBeenCalledTimes(0);
  });
});

describe('load scene', () => {
  test("should load scene if it's required", async () => {
    const setCurrentCharacter = jest.spyOn(
      EventFactory.prototype,
      'setCurrentCharacter',
    );
    const generateSessionToken = jest.fn(() => Promise.resolve(session));

    const connection = new ConnectionService({
      name: SCENE,
      config: { capabilities: capabilitiesProps },
      user,
      onError,
      onMessage,
      onDisconnect,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    const openSession = jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() =>
        Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
      );
    const setCharacters = jest.spyOn(EventFactory.prototype, 'setCharacters');

    await connection.getCharacters();
    await connection.getCharacters();

    expect(setCharacters).toHaveBeenCalledTimes(1);
    expect(setCharacters).toHaveBeenCalledWith(characters);
    expect(generateSessionToken).toHaveBeenCalledTimes(1);
    expect(openSession).toHaveBeenCalledTimes(1);
    expect(setCurrentCharacter).toHaveBeenCalledTimes(1);
  });
});

describe('interrupt', () => {
  test('should interrupt', async () => {
    const interactionId = v4();
    const utteranceId = v4();
    jest
      .spyOn(GrpcAudioPlayback.prototype, 'getCurrentPacket')
      .mockImplementationOnce(() => InworldPacket.fromProto(audioEvent));
    jest
      .spyOn(GrpcAudioPlayback.prototype, 'stopForInteraction')
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            ...audioEvent,
            packetId: {
              ...audioEvent.packetId,
              interactionId,
              utteranceId,
            },
          },
        ]),
      );
    const send = jest
      .spyOn(ConnectionService.prototype, 'send')
      .mockImplementationOnce(jest.fn());
    jest
      .spyOn(ConversationService.prototype, 'getConversationId')
      .mockImplementation(() => conversationId);

    const HOSTNAME = 'localhost:1235';
    const connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: HOSTNAME }, autoReconnect: false },
        capabilities: capabilitiesProps,
      },
      user,
      onError,
      onMessage,
      onDisconnect,
      onInterruption,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });
    jest
      .spyOn(connection, 'getCharactersByResourceNames')
      .mockImplementation((names: string[]) =>
        characters.filter((character) =>
          names.includes(character.resourceName),
        ),
      );

    connection.conversations.set(conversationId, {
      service: new ConversationService(connection, {
        participants: [characters[0].resourceName],
        conversationId,
        addCharacters: jest.fn(),
      }),
      state: ConversationState.ACTIVE,
    });

    await connection.interrupt();

    expect(send).toHaveBeenCalledTimes(1);
    expect(onInterruption).toHaveBeenCalledTimes(1);
    expect(onInterruption).toHaveBeenCalledWith({
      interactionId: interactionId,
      utteranceId: [utteranceId],
    });
  });
});
