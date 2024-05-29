import '../mocks/window.mock';

import { v4 } from 'uuid';

import { InworldClient } from '../../src/clients/inworld.client';
import { ConnectionService } from '../../src/services/connection.service';
import { ExtendedInworldPacket } from '../data_structures';
import {
  capabilitiesProps,
  client,
  extension,
  generateSessionToken,
  phrases,
  previousState,
  SCENE,
  user,
} from '../helpers';

jest.mock('../../src/services/connection.service');

describe('should finish with success', () => {
  let inworldClient: InworldClient;
  const onReady = jest.fn();
  const onError = jest.fn();
  const onMessage = jest.fn();
  const onWarning = jest.fn();
  const onDisconnect = jest.fn();
  const onStopPlaying = jest.fn();
  const onAfterPlaying = jest.fn();
  const onBeforePlaying = jest.fn();
  const onHistoryChange = jest.fn();
  const onInterruption = jest.fn();
  const onPhoneme = jest.fn();

  beforeEach(() => {
    inworldClient = new InworldClient()
      .setScene(SCENE)
      .setConfiguration({
        capabilities: capabilitiesProps,
        audioPlayback: { stop: { duration: 1000, ticks: 30 } },
        history: { previousState: true },
      })
      .setUser(user)
      .setClient(client)
      .setGenerateSessionToken(generateSessionToken)
      .setOnStopPlaying(onStopPlaying)
      .setOnAfterPlaying(onAfterPlaying)
      .setOnBeforePlaying(onBeforePlaying)
      .setOnDisconnect(onDisconnect)
      .setOnMessage(onMessage)
      .setOnWarning(onWarning)
      .setOnError(onError)
      .setOnReady(onReady)
      .setOnHistoryChange(onHistoryChange)
      .setOnInterruption(onInterruption)
      .setOnPhoneme(onPhoneme)
      .setSessionContinuation({ previousState, previousDialog: phrases });
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

  test('on empty scene', async () => {
    const client = new InworldClient().setScene(v4());

    expect(() => client.build()).toThrow('Scene name has wrong format');
  });

  test.each([
    {
      input: {
        duration: -500,
        ticks: 5,
      },
      field: 'duration',
    },
    {
      input: {
        duration: 0,
        ticks: 5,
      },
      field: 'duration',
    },
    {
      input: {
        duration: 500,
        ticks: -5,
      },
      field: 'ticks',
    },
    {
      input: {
        duration: 500,
        ticks: 0,
      },
      field: 'ticks',
    },
  ])('on wrong $input', ({ input, field }) => {
    const inworldClient = new InworldClient().setScene(SCENE).setConfiguration({
      audioPlayback: { stop: input },
    });

    expect(() => inworldClient.build()).toThrow(
      `Stop ${field} for audio playback should be a natural number`,
    );
  });
});

describe('extension', () => {
  test('should extend capabilities and packets', () => {
    const inworldClient = new InworldClient<ExtendedInworldPacket>()
      .setScene(SCENE)
      .setExtension(extension);

    inworldClient.build();

    expect(ConnectionService).toHaveBeenCalledTimes(1);
    expect(ConnectionService).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.anything(),
        extension,
      }),
    );
  });
});
