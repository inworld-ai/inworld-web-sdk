import {
  GetSessionStateRequest,
  StateSerialization,
} from '../../../proto/ai/inworld/engine/v1/state_serialization.pb';
import { CapabilitiesRequest } from '../../../proto/ai/inworld/engine/world-engine.pb';
import * as fm from '../../../proto/fetch.pb';
import { protoTimestamp } from '../../../src/common/helpers';
import { StateSerializationService } from '../../../src/services/pb/state_serialization.service';
import { previousStateUint8Array, SCENE, session } from '../../helpers';

describe('getSessionState', () => {
  let service: StateSerializationService;
  const capabilities: CapabilitiesRequest = {
    emotions: true,
  };

  beforeEach(() => {
    service = new StateSerializationService();
  });

  test('should return session state', async () => {
    const expected = {
      state: previousStateUint8Array,
      creationTime: protoTimestamp(),
    };

    const getSessionState = jest.fn(
      (_req: GetSessionStateRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve(expected);
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
    expect(result).toEqual(expected);
  });
});
