import WS from 'jest-websocket-mock';
import { v4 } from 'uuid';

import { InworldPacket as ProtoPacket } from '../../proto/packets.pb';
import { WebSocketConnection } from '../../src/connection/web-socket.connection';
import { EventFactory } from '../../src/factories/event';
import { capabilitiesProps, convertPacketFromProto, session } from '../helpers';

const eventFactory = new EventFactory();

let server: WS;
let ws: WebSocketConnection;

const HOSTNAME = 'localhost:1234';
const textMessage = eventFactory.text(v4());

const onReady = jest.fn();
const onError = jest.fn();
const onDisconnect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  server = new WS(`ws://${HOSTNAME}/v1/session/default`, {
    jsonProtocol: true,
  });

  ws = new WebSocketConnection({
    config: {
      connection: { gateway: { hostname: HOSTNAME } },
      capabilities: capabilitiesProps,
    },
    onReady,
  });
});

afterEach(() => {
  server.close();
  WS.clean();
});

describe('open', () => {
  test('should call onReady', async () => {
    ws.open({ session, convertPacketFromProto });

    await server.connected;

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onReady).toHaveBeenCalledTimes(1);
  });

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

    ws.open({ session, convertPacketFromProto });

    await server.connected;

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

    ws.open({ session, convertPacketFromProto });

    await server.connected;

    server.send({ error: 'Error' });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('should call onError in case of exception', async () => {
    const HOSTNAME = 'localhost:1235';
    new WS(`ws://${HOSTNAME}/v1/session/default`, {
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
      new Promise((_, reject) => {
        onError.mockImplementation(reject);
        ws.open({ session, convertPacketFromProto });
      }),
      // WebSocket onerror event gets called with an event of type error and not an error
    ).rejects.toEqual(expect.objectContaining({ type: 'error' }));
  });

  test('should call onDisconnect', async () => {
    const HOSTNAME = 'localhost:1235';

    const server = new WS(`ws://${HOSTNAME}/v1/session/default`);
    server.on('connection', (socket) => {
      socket.close({ wasClean: false, code: 1003, reason: 'NOPE' });
    });

    const ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onDisconnect,
    });

    ws.open({ session, convertPacketFromProto });

    await server.connected;
    await server.closed;

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('write', () => {
  test('should write to active connection', async () => {
    ws.open({ session, convertPacketFromProto });

    await server.connected;

    ws.write({
      getPacket: () => textMessage,
    });

    await expect(server).toReceiveMessage(textMessage);
  });

  test('should write when connection become active', async () => {
    ws.open({ session, convertPacketFromProto });
    ws.write({
      getPacket: () => textMessage,
    });

    await server.connected;

    await expect(server).toReceiveMessage(textMessage);
  });
});

describe('close', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should open and close connection', async () => {
    ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
      onDisconnect,
    });

    ws.open({ session, convertPacketFromProto });
    ws.write({
      getPacket: () => textMessage,
    });

    await server.connected;

    expect(() => ws.close()).not.toThrow();
  });

  test('should not throw error if connection is not open before', async () => {
    ws = new WebSocketConnection({
      config: {
        connection: { gateway: { hostname: HOSTNAME } },
        capabilities: capabilitiesProps,
      },
      onError,
      onReady,
    });

    expect(() => ws.close()).not.toThrow();
  });
});
