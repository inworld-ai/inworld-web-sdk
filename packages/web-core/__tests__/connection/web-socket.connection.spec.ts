import WS from 'jest-websocket-mock';
import { v4 } from 'uuid';

import {
  ErrorType as ProtoErrorType,
  InworldStatus,
  ReconnectionType as ProtoErrorReconnectionType,
} from '../../proto/ai/inworld/common/status.pb';
import {
  ContinuationContinuationType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import { CLIENT_ID } from '../../src/common/constants';
import { Awaitable, ConnectionConfig } from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import { WebSocketConnection } from '../../src/connection/web-socket.connection';
import { SessionContinuation } from '../../src/entities/continuation/session_continuation.entity';
import { InworldError } from '../../src/entities/error.entity';
import { EventFactory } from '../../src/factories/event';
import { ExtendedHistoryItem, ExtendedInworldPacket } from '../data_structures';
import {
  capabilitiesProps,
  conversationId,
  createCharacter,
  emitHistoryResponseEvent,
  emitSceneStatusEvent,
  extension,
  phrases,
  previousDialog,
  previousState,
  session,
  simpleExtension,
  user,
} from '../helpers';
const { version } = require('../../package.json');

const character = createCharacter();
const eventFactory = new EventFactory();
eventFactory.setCurrentCharacter(character);

let server: WS;
let ws: WebSocketConnection;

const HOSTNAME = 'localhost:1234';
const textMessage = eventFactory.text(v4(), { conversationId });

const onError = jest.fn();
const onReady = jest.fn();
const onMessage = jest.fn();
const onDisconnect = jest.fn();

const createWebSocket = (props: {
  connection: ConnectionConfig;
  gameSessionId?: string;
  history?: { previousState: boolean };
  onMessage?: (packet: ProtoPacket) => Awaitable<void>;
}) => {
  return new WebSocketConnection({
    config: {
      capabilities: capabilitiesProps,
      connection: props.connection,
      history: props.history,
      gameSessionId: props.gameSessionId,
    },
    extension: simpleExtension,
    onError,
    onReady,
    onMessage: props.onMessage || onMessage,
    onDisconnect,
  });
};

beforeEach(() => {
  server = new WS(`ws://${HOSTNAME}/v1/session/open`, {
    jsonProtocol: true,
  });

  ws = createWebSocket({
    connection: { gateway: { hostname: HOSTNAME } },
  });
});

afterEach(() => {
  server.close();
  WS.clean();
});

describe('open', () => {
  test('should call onMessage', async () => {
    const messages: ProtoPacket[] = [];
    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME } },
      onMessage: (packet: ProtoPacket) => {
        messages.push(packet);
      },
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(
        () => setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
        0,
      ),
    ]);

    server.send({ result: textMessage });
    server.send({ result: textMessage });

    expect(messages).toEqual([textMessage, textMessage]);
  });

  test('should call onError in case of error in message', async () => {
    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(
        () => setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
        0,
      ),
    ]);

    server.send({
      error: {
        message: 'Error',
        code: '1',
        details: [
          {
            errorType: ProtoErrorType.AUDIO_SESSION_EXPIRED,
            reconnectType: ProtoErrorReconnectionType.IMMEDIATE,
            maxRetries: 1,
            reconnectTime: protoTimestamp(),
          } as InworldStatus,
        ],
      },
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('should call onError in case of exception', async () => {
    const HOSTNAME = 'localhost:1235';
    new WS(`ws://${HOSTNAME}/v1/session/open`, {
      verifyClient: () => false,
    });
    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME } },
    });

    await expect(
      new Promise(async (_, reject) => {
        onError.mockImplementation(reject);
        await Promise.all([
          ws.openSession({
            name: v4(),
            session,
          }),
          setTimeout(
            () =>
              setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
            0,
          ),
        ]);
      }),
    ).rejects.toBeInstanceOf(InworldError);
  });

  test('should call onDisconnect', async () => {
    const HOSTNAME = 'localhost:1235';

    const server = new WS(`wss://${HOSTNAME}/v1/session/open`, {
      jsonProtocol: true,
    });

    server.on('connection', (socket) => {
      socket.close({ wasClean: false, code: 1003, reason: 'NOPE' });
    });

    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME, ssl: true } },
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(
        () => setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
        0,
      ),
    ]);

    await server.connected;
    await server.closed;

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  test('should use provided custom client id', async () => {
    const sceneClient = { id: 'client-id' };
    const description = [
      CLIENT_ID,
      version,
      navigator.userAgent,
      sceneClient.id,
    ];

    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        client: sceneClient,
      }),
      setTimeout(
        () => setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
        0,
      ),
    ]);

    await server.connected;

    const actualClient = JSON.parse(write.mock.calls[0][0] as string).control
      ?.sessionConfiguration?.clientConfiguration;

    expect(actualClient!.id).toEqual(CLIENT_ID);
    expect(actualClient!.version).toEqual(version);
    expect(actualClient!.description).toEqual(description.join('; '));
  });

  test("should not send client id if it's not provided", async () => {
    const description = [CLIENT_ID, version, navigator.userAgent];

    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(
        () => setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
        0,
      ),
    ]);

    await server.connected;

    const actualClient = JSON.parse(write.mock.calls[0][0] as string).control
      ?.sessionConfiguration?.clientConfiguration;

    expect(actualClient.id).toEqual(CLIENT_ID);
    expect(actualClient.version).toEqual(version);
    expect(actualClient.description).toEqual(description.join('; '));
  });

  test("should use default user id if it's not provided", async () => {
    const user = { fullName: 'Full Name' };

    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user,
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    const sentUser = JSON.parse(write.mock.calls[0][0] as string).control
      ?.sessionConfiguration?.userConfiguration;

    expect(sentUser.name).toEqual(user.fullName);
    expect(sentUser.id.length).not.toEqual(0);
  });

  test('should use provided provided user id', async () => {
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { id: user.id },
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    const sentUser = JSON.parse(write.mock.calls[0][0] as string).control
      ?.sessionConfiguration?.userConfiguration;

    expect(sentUser).toEqual({ id: user.id });
  });

  test('should use provided provided user profile', async () => {
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { profile: user.profile },
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    const sentUser = JSON.parse(write.mock.calls[0][0] as string).control
      ?.sessionConfiguration?.userConfiguration;

    expect(sentUser?.userSettings?.playerProfile?.fields[0]).toEqual({
      fieldId: user.profile!.fields[0].id,
      fieldValue: user.profile!.fields[0].value,
    });
  });

  test('should send previous dialog', async () => {
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({
          previousDialog: phrases,
        }),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    const continuation = JSON.parse(write.mock.calls[0][0] as string).control
      ?.sessionConfiguration?.continuation;

    expect(continuation?.dialogHistory).toEqual(previousDialog.toProto());
    expect(continuation?.continuationType).toEqual(
      ContinuationContinuationType.CONTINUATION_TYPE_DIALOG_HISTORY,
    );
  });

  test('should send previous state', async () => {
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({ previousState }),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    const continuation = JSON.parse(write.mock.calls[0][0] as string).control
      ?.sessionConfiguration?.continuation;

    expect(continuation?.externallySavedState).toEqual(previousState);
    expect(continuation?.continuationType).toEqual(
      ContinuationContinuationType.CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE,
    );
    expect(result[0].sessionHistory).toBeFalsy();
  });

  test('should send gameSessionId', async () => {
    const gameSessionId = v4();
    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME } },
      gameSessionId,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    const sessionConfiguration = JSON.parse(write.mock.calls[0][0] as string)
      .control?.sessionConfiguration?.sessionConfiguration;
    expect(sessionConfiguration?.gameSessionId).toEqual(gameSessionId);
  });

  test('should send history request', async () => {
    const ws = createWebSocket({
      history: { previousState: true },
      connection: { gateway: { hostname: HOSTNAME } },
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({ previousState }),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
      setTimeout(() => new Promise(emitHistoryResponseEvent(server)), 0),
    ]);

    await server.connected;

    expect(
      result[0].sessionHistory?.sessionHistoryItems?.length,
    ).toBeGreaterThan(0);
  });

  test('should not send history request if continuation is not provided', async () => {
    const ws = createWebSocket({
      history: { previousState: true },
      connection: { gateway: { hostname: HOSTNAME } },
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
      new Promise(emitHistoryResponseEvent(server)),
    ]);

    await server.connected;

    expect(result[0].sessionHistory).toBeFalsy();
  });

  test('should call extention functions', async () => {
    const ws = new WebSocketConnection<
      ExtendedInworldPacket,
      ExtendedHistoryItem
    >({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      extension,
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    expect(extension.beforeLoadScene).toHaveBeenCalledTimes(1);
  });

  test('should not throw error on empty extension', async () => {
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    expect(extension.beforeLoadScene).toHaveBeenCalledTimes(0);
    expect(extension.afterLoadScene).toHaveBeenCalledTimes(0);
  });

  test('should throw error if message is empty', async () => {
    const error = new Error('Invalid JSON received as WS event data');

    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    await expect(
      Promise.all([
        ws.openSession({
          name: v4(),
          sessionContinuation: new SessionContinuation({ previousState }),
          session,
        }),
        setTimeout(
          () =>
            new Promise((resolve: any) => {
              server.send('');
              resolve(true);
            }),
          0,
        ),
      ]),
    ).rejects.toHaveProperty('message', error.message);
  });
});

describe('reopen', () => {
  test('should call onMessage', async () => {
    const messages: ProtoPacket[] = [];
    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME } },
      onMessage: (packet: ProtoPacket) => {
        messages.push(packet);
      },
    });

    await ws.reopenSession(session);

    server.send({ result: textMessage });
    server.send({ result: textMessage });

    expect(messages).toEqual([textMessage, textMessage]);
  });

  test('should call onError in case of error in message', async () => {
    await Promise.all([
      ws.reopenSession(session),
      setTimeout(
        () => setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
        0,
      ),
    ]);

    server.send({ error: 'Error' });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('should call onError in case of exception', async () => {
    const HOSTNAME = 'localhost:1235';
    new WS(`ws://${HOSTNAME}/v1/session/open`, {
      verifyClient: () => false,
    });
    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME } },
    });

    await expect(
      new Promise(async (_, reject) => {
        onError.mockImplementation(reject);
        await Promise.all([
          ws.reopenSession(session),
          setTimeout(
            () =>
              setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
            0,
          ),
        ]);
      }),
    ).rejects.toBeInstanceOf(InworldError);
  });

  test('should call onDisconnect', async () => {
    const HOSTNAME = 'localhost:1235';

    const server = new WS(`wss://${HOSTNAME}/v1/session/open`, {
      jsonProtocol: true,
    });

    server.on('connection', (socket) => {
      socket.close({ wasClean: false, code: 1003, reason: 'NOPE' });
    });

    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME, ssl: true } },
    });

    await Promise.all([
      ws.reopenSession(session),
      setTimeout(
        () => setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
        0,
      ),
    ]);

    await server.connected;
    await server.closed;

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('update', () => {
  test('should call onMessage', async () => {
    const messages: ProtoPacket[] = [];
    const ws = createWebSocket({
      connection: { gateway: { hostname: HOSTNAME } },
      onMessage: (packet: ProtoPacket) => {
        messages.push(packet);
      },
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { profile: user.profile },
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    await server.connected;

    const newName = v4();
    const newCapabilities = { ...capabilitiesProps, audio: false };
    const gameSessionId = v4();
    const sessionContinuation = new SessionContinuation({
      previousState,
    });

    expect(write).toHaveBeenCalledTimes(2);

    await Promise.all([
      ws.updateSession({
        name: newName,
        gameSessionId,
        capabilities: newCapabilities,
        sessionContinuation,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server, newName)), 0),
    ]);

    expect(write).toHaveBeenCalledTimes(4);

    server.send({ result: textMessage });

    expect(messages[2].control?.currentSceneStatus?.sceneName).toEqual(newName);
    expect(messages[3]).toEqual(textMessage);

    expect(
      JSON.parse(write.mock.calls[2][0] as string).control.sessionConfiguration,
    ).toEqual({
      capabilitiesConfiguration: newCapabilities,
      sessionConfiguration: { gameSessionId },
      continuation: {
        continuationType:
          ContinuationContinuationType.CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE,
        externallySavedState: previousState,
      },
    });
  });

  test('should send history request', async () => {
    const messages: ProtoPacket[] = [];
    const ws = createWebSocket({
      history: { previousState: true },
      connection: { gateway: { hostname: HOSTNAME } },
      onMessage: (packet: ProtoPacket) => {
        messages.push(packet);
      },
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { profile: user.profile },
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
      setTimeout(() => new Promise(emitHistoryResponseEvent(server)), 0),
    ]);

    await server.connected;

    const newName = v4();
    const newCapabilities = { ...capabilitiesProps, audio: false };
    const gameSessionId = v4();
    const sessionContinuation = new SessionContinuation({
      previousState,
    });

    expect(write).toHaveBeenCalledTimes(2);

    await Promise.all([
      ws.updateSession({
        name: newName,
        gameSessionId,
        capabilities: newCapabilities,
        sessionContinuation,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server, newName)), 0),
      setTimeout(() => new Promise(emitHistoryResponseEvent(server)), 0),
    ]);

    expect(write).toHaveBeenCalledTimes(4);
  });
});

describe('close', () => {
  test('with Disconnect', async () => {
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    ws.write({
      getPacket: () => textMessage,
    });

    await server.connected;

    expect(() => ws.close()).not.toThrow();
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  test('should not throw error if connection is not open before', async () => {
    expect(() => ws.close()).not.toThrow();
  });
});

describe('write', () => {
  let send: any;

  beforeEach(() => {
    send = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());
  });

  test('should call beforeWriting and afterWriting', async () => {
    const beforeWriting = jest.fn();
    const afterWriting = jest.fn();
    const packet = textMessage;

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    ws.write({
      getPacket: () => packet,
      beforeWriting,
      afterWriting,
    });

    await server.connected;

    expect(send).toHaveBeenCalledTimes(3);
    expect(beforeWriting).toHaveBeenCalledTimes(1);
    expect(afterWriting).toHaveBeenCalledTimes(1);
  });

  test('should work without beforeWriting and afterWriting', async () => {
    const packet = textMessage;

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
      }),
      setTimeout(() => new Promise(emitSceneStatusEvent(server)), 0),
    ]);

    ws.write({
      getPacket: () => packet,
    });

    await server.connected;

    expect(send).toHaveBeenCalledTimes(3);
  });
});
