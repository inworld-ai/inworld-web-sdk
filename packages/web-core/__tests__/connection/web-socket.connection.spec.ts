import WS from 'jest-websocket-mock';
import { v4 } from 'uuid';

import {
  ContinuationContinuationType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import { CLIENT_ID } from '../../src/common/constants';
import { WebSocketConnection } from '../../src/connection/web-socket.connection';
import { SessionContinuation } from '../../src/entities/continuation/session_continuation.entity';
import { EventFactory } from '../../src/factories/event';
import { ExtendedHistoryItem, ExtendedInworldPacket } from '../data_structures';
import {
  capabilitiesProps,
  convertPacketFromProto,
  createCharacter,
  emitHistoryResponseEvent,
  emitSessionControlResponseEvent,
  extension,
  phrases,
  previousDialog,
  previousState,
  session,
  user,
} from '../helpers';
const { version } = require('../../package.json');

const conversationId = v4();
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

beforeEach(() => {
  server = new WS(`ws://${HOSTNAME}/v1/session/open`, {
    jsonProtocol: true,
  });

  ws = new WebSocketConnection({
    config: {
      connection: { gateway: { hostname: HOSTNAME } },
      capabilities: capabilitiesProps,
    },
    onError,
    onReady,
    onMessage,
    onDisconnect,
  });
});

afterEach(() => {
  server.close();
  WS.clean();
});

describe('open', () => {
  test('should call onMessage', async () => {
    const messages: ProtoPacket[] = [];
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onMessage: (packet: ProtoPacket) => {
        messages.push(packet);
      },
      onError,
      onReady,
      onDisconnect,
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(
        () =>
          setTimeout(
            () => new Promise(emitSessionControlResponseEvent(server)),
            0,
          ),
        0,
      ),
    ]);

    server.send({ result: textMessage });
    server.send({ result: textMessage });

    expect(messages).toEqual([textMessage, textMessage]);
  });

  test('should call onError in case of error in message', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(
        () =>
          setTimeout(
            () => new Promise(emitSessionControlResponseEvent(server)),
            0,
          ),
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
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

    await expect(
      new Promise(async (_, reject) => {
        onError.mockImplementation(reject);
        await Promise.all([
          ws.openSession({
            name: v4(),
            session,
            convertPacketFromProto,
          }),
          setTimeout(
            () =>
              setTimeout(
                () => new Promise(emitSessionControlResponseEvent(server)),
                0,
              ),
            0,
          ),
        ]);
      }),
      // WebSocket onerror event gets called with an event of type error and not an error
    ).rejects.toEqual(expect.objectContaining({ type: 'error' }));
  });

  test('should call onDisconnect', async () => {
    const HOSTNAME = 'localhost:1235';

    const server = new WS(`wss://${HOSTNAME}/v1/session/open`, {
      jsonProtocol: true,
    });

    server.on('connection', (socket) => {
      socket.close({ wasClean: false, code: 1003, reason: 'NOPE' });
    });

    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME, ssl: true } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(
        () =>
          setTimeout(
            () => new Promise(emitSessionControlResponseEvent(server)),
            0,
          ),
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

    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
        client: sceneClient,
      }),
      setTimeout(
        () =>
          setTimeout(
            () => new Promise(emitSessionControlResponseEvent(server)),
            0,
          ),
        0,
      ),
    ]);

    await server.connected;

    const actualClient = JSON.parse(write.mock.calls[1][0] as string)
      .sessionControl?.clientConfiguration;

    expect(actualClient!.id).toEqual(CLIENT_ID);
    expect(actualClient!.version).toEqual(version);
    expect(actualClient!.description).toEqual(description.join('; '));
  });

  test("should not send client id if it's not provided", async () => {
    const description = [CLIENT_ID, version, navigator.userAgent];

    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(
        () =>
          setTimeout(
            () => new Promise(emitSessionControlResponseEvent(server)),
            0,
          ),
        0,
      ),
    ]);

    await server.connected;

    const actualClient = JSON.parse(write.mock.calls[1][0] as string)
      .sessionControl?.clientConfiguration;

    expect(actualClient.id).toEqual(CLIENT_ID);
    expect(actualClient.version).toEqual(version);
    expect(actualClient.description).toEqual(description.join('; '));
  });

  test("should use default user id if it's not provided", async () => {
    const user = { fullName: 'Full Name' };

    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user,
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    const sentUser = JSON.parse(write.mock.calls[2][0] as string).sessionControl
      ?.userConfiguration;

    expect(sentUser.name).toEqual(user.fullName);
    expect(sentUser.id.length).not.toEqual(0);
  });

  test('should use provided provided user id', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { id: user.id },
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    const sentUser = JSON.parse(write.mock.calls[2][0] as string).sessionControl
      ?.userConfiguration;

    expect(sentUser).toEqual({ id: user.id });
  });

  test('should use provided provided user profile', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { profile: user.profile },
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    const sentUser = JSON.parse(write.mock.calls[2][0] as string).sessionControl
      ?.userConfiguration;

    expect(sentUser?.userSettings?.playerProfile?.fields[0]).toEqual({
      fieldId: user.profile!.fields[0].id,
      fieldValue: user.profile!.fields[0].value,
    });
  });

  test('should send previous dialog', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
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
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    const continuation = JSON.parse(write.mock.calls[3][0] as string)
      .sessionControl?.continuation;

    expect(continuation?.dialogHistory).toEqual(previousDialog.toProto());
    expect(continuation?.continuationType).toEqual(
      ContinuationContinuationType.CONTINUATION_TYPE_DIALOG_HISTORY,
    );
  });

  test('should send previous state', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({ previousState }),
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    const continuation = JSON.parse(write.mock.calls[3][0] as string)
      .sessionControl?.continuation;

    expect(continuation?.externallySavedState).toEqual(previousState);
    expect(continuation?.continuationType).toEqual(
      ContinuationContinuationType.CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE,
    );
    expect(result[0].sessionHistory).toBeFalsy();
  });

  test('should send gameSessionId', async () => {
    const gameSessionId = v4();
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
        gameSessionId,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const write = jest
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    const sessionConfiguration = JSON.parse(write.mock.calls[1][0] as string)
      .sessionControl?.sessionConfiguration;

    expect(sessionConfiguration?.gameSessionId).toEqual(gameSessionId);
  });

  test('should send history request', async () => {
    const ws = new WebSocketConnection({
      config: {
        history: { previousState: true },
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({ previousState }),
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
      setTimeout(() => new Promise(emitHistoryResponseEvent(server)), 0),
    ]);

    await server.connected;

    expect(
      result[0].sessionHistory?.sessionHistoryItems?.length,
    ).toBeGreaterThan(0);
  });

  test('should not send history request if continuation is not provided', async () => {
    const ws = new WebSocketConnection({
      config: {
        history: { previousState: true },
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
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
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        extension,
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    expect(extension.beforeLoadScene).toHaveBeenCalledTimes(1);
  });

  test('should not throw error on empty extension', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    await Promise.all([
      ws.openSession({
        name: v4(),
        extension: {},
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    await server.connected;

    expect(extension.beforeLoadScene).toHaveBeenCalledTimes(0);
    expect(extension.afterLoadScene).toHaveBeenCalledTimes(0);
  });

  test('should throw error if message is empty', async () => {
    const error = new Error('Invalid JSON received as WS event data');
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    jest.spyOn(WebSocket.prototype, 'send').mockImplementation(jest.fn());

    await expect(
      Promise.all([
        ws.openSession({
          name: v4(),
          sessionContinuation: new SessionContinuation({ previousState }),
          session,
          convertPacketFromProto,
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
    ).rejects.toEqual(error);
  });
});

describe('reopen', () => {
  test('should call onMessage', async () => {
    const messages: ProtoPacket[] = [];
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onMessage: (packet: ProtoPacket) => {
        messages.push(packet);
      },
      onError,
      onReady,
      onDisconnect,
    });

    await ws.reopenSession(session);

    server.send({ result: textMessage });
    server.send({ result: textMessage });

    expect(messages).toEqual([textMessage, textMessage]);
  });

  test('should call onError in case of error in message', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

    await Promise.all([
      ws.reopenSession(session),
      setTimeout(
        () =>
          setTimeout(
            () => new Promise(emitSessionControlResponseEvent(server)),
            0,
          ),
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
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

    await expect(
      new Promise(async (_, reject) => {
        onError.mockImplementation(reject);
        await Promise.all([
          ws.reopenSession(session),
          setTimeout(
            () =>
              setTimeout(
                () => new Promise(emitSessionControlResponseEvent(server)),
                0,
              ),
            0,
          ),
        ]);
      }),
      // WebSocket onerror event gets called with an event of type error and not an error
    ).rejects.toEqual(expect.objectContaining({ type: 'error' }));
  });

  test('should call onDisconnect', async () => {
    const HOSTNAME = 'localhost:1235';

    const server = new WS(`wss://${HOSTNAME}/v1/session/open`, {
      jsonProtocol: true,
    });

    server.on('connection', (socket) => {
      socket.close({ wasClean: false, code: 1003, reason: 'NOPE' });
    });

    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME, ssl: true } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

    await Promise.all([
      ws.reopenSession(session),
      setTimeout(
        () =>
          setTimeout(
            () => new Promise(emitSessionControlResponseEvent(server)),
            0,
          ),
        0,
      ),
    ]);

    await server.connected;
    await server.closed;

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('close', () => {
  test('with Disconnect', async () => {
    ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
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
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    ws.write({
      getPacket: () => textMessage,
    });

    await server.connected;

    expect(() => ws.close()).not.toThrow();
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  test('should not throw error if connection is not open before', async () => {
    ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

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
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });

    const beforeWriting = jest.fn();
    const afterWriting = jest.fn();
    const packet = textMessage;

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    ws.write({
      getPacket: () => packet,
      beforeWriting,
      afterWriting,
    });

    await server.connected;

    expect(send).toHaveBeenCalledTimes(5);
    expect(beforeWriting).toHaveBeenCalledTimes(1);
    expect(afterWriting).toHaveBeenCalledTimes(1);
  });

  test('should work without beforeWriting and afterWriting', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onMessage,
      onDisconnect,
    });
    const packet = textMessage;

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      setTimeout(() => new Promise(emitSessionControlResponseEvent(server)), 0),
    ]);

    ws.write({
      getPacket: () => packet,
    });

    await server.connected;

    expect(send).toHaveBeenCalledTimes(5);
  });
});
