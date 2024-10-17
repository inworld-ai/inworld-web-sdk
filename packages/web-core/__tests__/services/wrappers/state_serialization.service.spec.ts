import '../../mocks/window.mock';

import { v4 } from 'uuid';

import { protoTimestamp } from '../../../src/common/helpers';
import { ConnectionService } from '../../../src/services/connection.service';
import { StateSerializationService } from '../../../src/services/pb/state_serialization.service';
import { StateSerializationService as Wrapper } from '../../../src/services/wrappers/state_serialization.service';

test('should return session state with version', async () => {
  const connection = new ConnectionService();
  const expected = {
    state: v4(),
    creationTime: protoTimestamp(),
    version: {
      interactionId: v4(),
    },
  };

  const getSessionState = jest
    .spyOn(StateSerializationService.prototype, 'getSessionState')
    .mockImplementationOnce(() => Promise.resolve(expected));
  const ensureSessionToken = jest
    .spyOn(ConnectionService.prototype, 'ensureSessionToken')
    .mockImplementation(jest.fn());

  const result = await new Wrapper(connection).get();

  expect(getSessionState).toHaveBeenCalledTimes(1);
  expect(ensureSessionToken).toHaveBeenCalledTimes(1);
  expect(result).toEqual(expected);
});
