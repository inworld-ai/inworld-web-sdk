import { v4 } from 'uuid';

import * as fm from '../../proto/fetch.pb';
import {
  CapabilitiesRequest,
  LoadSceneRequest,
  WorldEngine,
} from '../../proto/world-engine.pb';
import { CLIENT_ID } from '../../src/common/constants';
import { WorldEngineService } from '../../src/services/world_engine.service';
import { createAgent, session, user } from '../helpers';
const SCENE = v4();

const agents = [createAgent(), createAgent()];

describe('load scene', () => {
  let client: WorldEngineService;
  const capabilities: CapabilitiesRequest = {
    animations: true,
    emotions: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    client = new WorldEngineService();
  });

  test('should use provided capabilities and gateway', async () => {
    const mockLoadScene = jest.fn(
      (_req: LoadSceneRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve({ agents });
      },
    );

    WorldEngine.LoadScene = mockLoadScene;

    const result = await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      name: SCENE,
      session,
      user,
    });

    const loadedAgents = result.agents;
    const callCapabilities = mockLoadScene.mock.calls[0][0].capabilities;

    expect(mockLoadScene).toHaveBeenCalledTimes(1);
    expect(loadedAgents).toEqual(agents);
    expect(loadedAgents.length).toEqual(agents.length);
    expect(loadedAgents[0].agentId).toEqual(agents[0].agentId);
    expect(loadedAgents[1].agentId).toEqual(agents[1].agentId);
    expect(callCapabilities.emotions).toEqual(true);
    expect(callCapabilities.animations).toEqual(true);
    expect(mockLoadScene.mock.calls[0][0].client.id).toEqual(CLIENT_ID);
  });

  test('should use provided custom client id', async () => {
    const sceneClient = { id: 'client-id' };
    const mockLoadScene = jest.fn(
      (_req: LoadSceneRequest, _initReq?: fm.InitReq) => {
        return Promise.resolve({ agents });
      },
    );

    WorldEngine.LoadScene = mockLoadScene;

    await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      client: sceneClient,
      name: SCENE,
      session,
      user,
    });
    expect(mockLoadScene.mock.calls[0][0].client).toEqual(sceneClient);
  });

  test("should use default user id if it's not provided", async () => {
    const user = { fullName: 'Full Name' };
    const mockLoadScene = jest.fn(
      (_req: LoadSceneRequest, _initReq?: fm.InitReq) => {
        return Promise.resolve({ agents });
      },
    );

    WorldEngine.LoadScene = mockLoadScene;

    await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      name: SCENE,
      session,
      user,
    });

    const sentUser = mockLoadScene.mock.calls[0][0].user;

    expect(sentUser.name).toEqual(user.fullName);
    expect(sentUser.id.length).not.toEqual(0);

    await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      name: SCENE,
      session,
      user,
    });

    expect(sentUser.id).toEqual(mockLoadScene.mock.calls[1][0].user.id);
  });

  test('should use http url is ssl option is not provided', async () => {
    const mockLoadScene = jest.fn(
      (_req: LoadSceneRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('http://examples.com');
        return Promise.resolve({ agents });
      },
    );

    WorldEngine.LoadScene = mockLoadScene;

    await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com' },
        },
      },
      name: SCENE,
      session,
      user,
    });
  });

  test('should use provided provided user id', async () => {
    const mockLoadScene = jest.fn(
      (_req: LoadSceneRequest, _initReq?: fm.InitReq) => {
        return Promise.resolve({ agents });
      },
    );

    WorldEngine.LoadScene = mockLoadScene;

    await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      name: SCENE,
      session,
      user: { id: user.id },
    });
    expect(mockLoadScene.mock.calls[0][0].user).toEqual({ id: user.id });
  });

  test('should use provided provided user name', async () => {
    const mockLoadScene = jest.fn(
      (_req: LoadSceneRequest, _initReq?: fm.InitReq) => {
        return Promise.resolve({ agents });
      },
    );

    WorldEngine.LoadScene = mockLoadScene;

    await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      name: SCENE,
      session,
      user: { fullName: user.fullName },
    });
    expect(mockLoadScene.mock.calls[0][0].user.name).toEqual(user.fullName);
  });

  test('should use provided provided user profile', async () => {
    const mockLoadScene = jest.fn(
      (_req: LoadSceneRequest, _initReq?: fm.InitReq) => {
        return Promise.resolve({ agents });
      },
    );

    WorldEngine.LoadScene = mockLoadScene;

    await client.loadScene({
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      name: SCENE,
      session,
      user: { profile: user.profile },
    });
    expect(
      mockLoadScene.mock.calls[0][0].userSettings.playerProfile.fields[0],
    ).toEqual({
      fieldId: user.profile.fields[0].id,
      fieldValue: user.profile.fields[0].value,
    });
  });
});
