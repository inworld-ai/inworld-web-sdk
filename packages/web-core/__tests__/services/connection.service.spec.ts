import '../mocks/window.mock';

import WS from 'jest-websocket-mock';
import { v4 } from 'uuid';

import {
  ActorType,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import { TtsPlaybackAction } from '../../src/common/data_structures';
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
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { Scene } from '../../src/entities/scene.entity';
import { SessionToken } from '../../src/entities/session_token.entity';
import { EventFactory } from '../../src/factories/event';
import { ConnectionService } from '../../src/services/connection.service';
import {
  SessionState,
  StateSerializationService,
} from '../../src/services/pb/state_serialization.service';
import {
  capabilitiesProps,
  convertAgentsToCharacters,
  convertPacketFromProto,
  createAgent,
  emitSessionControlResponseEvent,
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

const textEvent = eventFactory.text(v4());
const audioEvent = eventFactory.dataChunk(v4(), DataChunkDataType.AUDIO);
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

  test('should execute without errors', async () => {
    const openSession = jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));
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
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));

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
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));

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
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));

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
          characters,
          history: [incomingTextEvent],
        } as Scene),
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
      onHistoryChange: (history: HistoryItem[], diff: HistoryItem[]) => {
        const result = [convertPacketFromProto(incomingTextEvent)];

        expect(diff).toEqual(result);
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
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));

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
            source: {
              isCharacter: false,
              isPlayer: true,
              name: undefined,
            },
            text: textEvent.text.text,
            type: CHAT_HISTORY_TYPE.ACTOR,
          },
        ]);
      },
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    await Promise.all([
      connection.send(() => textEvent),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
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
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));
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
          },
        }),
      ]);

    await Promise.all([
      connection.send(() => textEvent),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
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

  test('should add playback mute event to queue in case of auto reconnect', async () => {
    const open = jest.spyOn(ConnectionService.prototype, 'open');
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);
    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));
    jest
      .spyOn(ConnectionService.prototype, 'getTtsPlaybackAction')
      .mockImplementationOnce(() => TtsPlaybackAction.MUTE);

    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: '' } },
        capabilities: capabilitiesProps,
      },
      user,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    await Promise.all([
      connection.send(() => textEvent),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    expect(open).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(2);
    expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
      ControlEventAction.TTS_PLAYBACK_MUTE,
    );
    expect(write.mock.calls[1][0].getPacket().text?.text).toEqual(
      textEvent.text?.text,
    );
  });

  test('should not add playback mute event to queue in case of manual reconnect', async () => {
    connection = new ConnectionService({
      name: SCENE,
      config: {
        connection: { gateway: { hostname: HOSTNAME }, autoReconnect: false },
        capabilities: capabilitiesProps,
      },
      user,
      grpcAudioPlayer,
      generateSessionToken,
      webRtcLoopbackBiDiSession,
    });

    const write = jest.spyOn(WebSocketConnection.prototype, 'write');

    jest
      .spyOn(WebSocketConnection.prototype, 'openSession')
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));

    jest
      .spyOn(ConnectionService.prototype, 'getTtsPlaybackAction')
      .mockImplementationOnce(() => TtsPlaybackAction.MUTE);

    await Promise.all([
      connection.open(),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    expect(write).toHaveBeenCalledTimes(0);
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
          },
        }),
      ]);
    jest.spyOn(connection, 'isActive').mockImplementation(() => true);

    await Promise.all([
      connection.open(),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);
    await server.connected;

    await connection.send(() => textEvent);

    server.send({ result: incomingTextEvent });

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
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
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
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);
    await server.connected;

    server.send({ result: audioEvent });
  });
});

describe('loadCharacters', () => {
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
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene))
      .mockImplementationOnce(() => Promise.resolve({ characters } as Scene));
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

    await connection.interrupt();

    expect(send).toHaveBeenCalledTimes(1);
    expect(onInterruption).toHaveBeenCalledTimes(1);
    expect(onInterruption).toHaveBeenCalledWith({
      interactionId: interactionId,
      utteranceId: [utteranceId],
    });
  });
});
