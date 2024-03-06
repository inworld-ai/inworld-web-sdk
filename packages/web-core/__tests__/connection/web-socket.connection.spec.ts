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
  writeMock,
} from '../helpers';
const { version } = require('../../package.json');

const character = createCharacter();
const eventFactory = new EventFactory();
eventFactory.setCurrentCharacter(character);

let server: WS;
let ws: WebSocketConnection;

const HOSTNAME = 'localhost:1234';
const textMessage = eventFactory.text(v4());

const onError = jest.fn();
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
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
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
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
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
          new Promise(emitSessionControlResponseEvent(server)),
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
      onDisconnect,
    });

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
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
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
        client: sceneClient,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const actualClient =
      write.mock.calls[1][0].getPacket().sessionControl?.clientConfiguration;

    expect(actualClient.id).toEqual(CLIENT_ID);
    expect(actualClient.version).toEqual(version);
    expect(actualClient.description).toEqual(description.join('; '));
  });

  test("should not send client id if it's not provided", async () => {
    const description = [CLIENT_ID, version, navigator.userAgent];

    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const actualClient =
      write.mock.calls[1][0].getPacket().sessionControl?.clientConfiguration;

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
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        user,
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const sentUser =
      write.mock.calls[2][0].getPacket().sessionControl?.userConfiguration;

    expect(sentUser.name).toEqual(user.fullName);
    expect(sentUser.id.length).not.toEqual(0);
  });

  test('should use provided provided user id', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { id: user.id },
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const sentUser =
      write.mock.calls[2][0].getPacket().sessionControl?.userConfiguration;

    expect(sentUser).toEqual({ id: user.id });
  });

  test('should use provided provided user profile', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        user: { profile: user.profile },
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const sentUser =
      write.mock.calls[2][0].getPacket().sessionControl?.userConfiguration;

    expect(sentUser?.userSettings?.playerProfile?.fields[0]).toEqual({
      fieldId: user.profile.fields[0].id,
      fieldValue: user.profile.fields[0].value,
    });
  });

  test('should send previous dialog', async () => {
    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({
          previousDialog: phrases,
        }),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const continuation =
      write.mock.calls[3][0].getPacket().sessionControl?.continuation;

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
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({ previousState }),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const continuation =
      write.mock.calls[3][0].getPacket().sessionControl?.continuation;

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
    });
    const write = jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
    ]);

    await server.connected;

    const sessionConfiguration =
      write.mock.calls[1][0].getPacket().sessionControl?.sessionConfiguration;

    expect(sessionConfiguration?.gameSessionId).toEqual(gameSessionId);
  });

  test('should send history request', async () => {
    const ws = new WebSocketConnection({
      config: {
        history: { previousState: true },
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
    });
    jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        sessionContinuation: new SessionContinuation({ previousState }),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
      new Promise(emitHistoryResponseEvent(server)),
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
    });
    jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    const result = await Promise.all([
      ws.openSession({
        name: v4(),
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
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
    });
    jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        extension,
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
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
    });
    jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await Promise.all([
      ws.openSession({
        name: v4(),
        extension: {},
        session,
        convertPacketFromProto,
      }),
      new Promise(emitSessionControlResponseEvent(server)),
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
    });
    jest
      .spyOn(WebSocketConnection.prototype, 'write')
      .mockImplementation(writeMock);

    await expect(
      Promise.all([
        ws.openSession({
          name: v4(),
          sessionContinuation: new SessionContinuation({ previousState }),
          session,
          convertPacketFromProto,
        }),
        new Promise((resolve: any) => {
          server.send('');
          resolve(true);
        }),
      ]),
    ).rejects.toEqual(error);
  });
});

describe('close', () => {
  describe('should open and close connection', () => {
    test('with Disconnect', async () => {
      ws = new WebSocketConnection({
        config: {
          connection: { gateway: { hostname: HOSTNAME } },
          capabilities: capabilitiesProps,
        },
        onError,
        onDisconnect,
      });

      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      await Promise.all([
        ws.openSession({
          name: v4(),
          session,
          convertPacketFromProto,
        }),
        new Promise(emitSessionControlResponseEvent(server)),
      ]);

      ws.write({
        getPacket: () => textMessage,
      });

      await server.connected;

      expect(() => ws.close()).not.toThrow();
      expect(onDisconnect).toHaveBeenCalledTimes(1);
    });

    test('without Disconnect', async () => {
      ws = new WebSocketConnection({
        config: {
          connection: { gateway: { hostname: HOSTNAME } },
          capabilities: capabilitiesProps,
        },
        onError,
      });

      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      await Promise.all([
        ws.openSession({
          name: v4(),
          session,
          convertPacketFromProto,
        }),
        new Promise(emitSessionControlResponseEvent(server)),
      ]);
      ws.write({
        getPacket: () => textMessage,
      });

      await server.connected;

      expect(() => ws.close()).not.toThrow();
      expect(onDisconnect).toHaveBeenCalledTimes(0);
    });
  });

  test('should not throw error if connection is not open before', async () => {
    ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onDisconnect,
    });

    expect(() => ws.close()).not.toThrow();
  });
});
