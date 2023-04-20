import '../mocks/window.mock';

import { InworldClient } from '../../src/clients/inworld.client';
import {
  capabilitiesProps,
  client,
  generateSessionToken,
  SCENE,
  user,
} from '../helpers';

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
      .setOnHistoryChange(onHistoryChange);
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
    const inworldClient = new InworldClient().setScene(SCENE).setConfiguration({
      connection: {
        gateway: {
          hostname: 'locahost',
          ssl: true,
        },
      },
    });
    expect(() => inworldClient.build()).not.toThrow();
  });
});

describe('should throw error', () => {
  test('on empty scene', async () => {
    const inworldClient = new InworldClient().setScene('');

    expect(() => inworldClient.build()).toThrow('Scene name is required');
  });
});
