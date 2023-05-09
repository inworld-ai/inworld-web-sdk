import '../mocks/window.mock';

import { InworldClient } from '../../src/clients/inworld.client';
import { ConnectionService } from '../../src/services/connection.service';
import {
  ExtendedCapabilities,
  ExtendedInworldPacket,
} from '../data_structures';
import {
  capabilitiesProps,
  client,
  extendedCapabilitiesProps,
  extendedCapabilitiesRequestProps,
  extension,
  generateSessionToken,
  SCENE,
  user,
} from '../helpers';

jest.mock('../../src/services/connection.service');

describe('should finish with success', () => {
  let inworldClient: InworldClient;
  const onReady = jest.fn();
  const onError = jest.fn();
  const onMessage = jest.fn();
  const onDisconnect = jest.fn();
  const onStopPlaying = jest.fn();
  const onAfterPlaying = jest.fn();
  const onBeforePlaying = jest.fn();
  const onHistoryChange = jest.fn();
  const onPhoneme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    inworldClient = new InworldClient()
      .setScene(SCENE)
      .setConfiguration({ capabilities: capabilitiesProps })
      .setUser(user)
      .setClient(client)
      .setGenerateSessionToken(generateSessionToken)
      .setOnStopPlaying(onStopPlaying)
      .setOnAfterPlaying(onAfterPlaying)
      .setOnBeforePlaying(onBeforePlaying)
      .setOnDisconnect(onDisconnect)
      .setOnMessage(onMessage)
      .setOnError(onError)
      .setOnReady(onReady)
      .setOnHistoryChange(onHistoryChange)
      .setOnPhoneme(onPhoneme);
  });

  test('should open connection', async () => {
    expect(() => inworldClient.build()).not.toThrow();
  });

  test('should not throw error is only emotion capability is set explicitly', async () => {
    const inworldClient = new InworldClient()
      .setScene(SCENE)
      // audio is enabled by default
      .setConfiguration({ capabilities: { emotions: true } });
    expect(() => inworldClient.build()).not.toThrow();
  });

  test('should allow to specify custom gateway', async () => {
    const connection = {
      gateway: {
        hostname: 'locahost',
        ssl: true,
      },
    };
    const inworldClient = new InworldClient().setScene(SCENE).setConfiguration({
      connection,
    });
    inworldClient.build();

    expect(ConnectionService).toHaveBeenCalledTimes(1);
    expect(ConnectionService).toHaveBeenCalledWith(
      expect.objectContaining({
        config: {
          connection,
          capabilities: expect.anything(),
        },
      }),
    );
  });
});

describe('should throw error', () => {
  test('on empty scene', async () => {
    const inworldClient = new InworldClient().setScene('');

    expect(() => inworldClient.build()).toThrow('Scene name is required');
  });
});

describe('extension', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should extend capabilities and packets', () => {
    const inworldClient = new InworldClient<
      ExtendedCapabilities,
      ExtendedInworldPacket
    >()
      .setScene(SCENE)
      .setConfiguration({
        capabilities: extendedCapabilitiesProps,
      })
      .setExtension(extension);

    inworldClient.build();

    expect(ConnectionService).toHaveBeenCalledTimes(1);
    expect(ConnectionService).toHaveBeenCalledWith(
      expect.objectContaining({
        config: {
          connection: expect.anything(),
          capabilities: extendedCapabilitiesRequestProps,
        },
        extension,
      }),
    );
  });
});
