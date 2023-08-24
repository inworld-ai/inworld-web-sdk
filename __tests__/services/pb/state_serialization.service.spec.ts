import * as fm from '../../../proto/fetch.pb';
import {
  GetSessionStateRequest,
  StateSerialization,
} from '../../../proto/state_serialization.pb';
import { CapabilitiesRequest } from '../../../proto/world-engine.pb';
import { StateSerializationService } from '../../../src/services/pb/state_serialization.service';
import { previousState, SCENE, session } from '../../helpers';

describe('getSessionState', () => {
  let service: StateSerializationService;
  const capabilities: CapabilitiesRequest = {
    emotions: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StateSerializationService();
  });

  test('should return session state', async () => {
    const state = { state: previousState };

    const getSessionState = jest.fn(
      (_req: GetSessionStateRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve(state);
      },
    );

    StateSerialization.GetSessionState = getSessionState;

    const result = await service.getSessionState({
      scene: SCENE,
      session,
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
    });

    expect(getSessionState).toHaveBeenCalledTimes(1);
    expect(result).toEqual(state);
  });
});
