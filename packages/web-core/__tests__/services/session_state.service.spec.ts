import '../mocks/window.mock';

import { v4 } from 'uuid';

import { DEFAULT_SESSION_STATE_KEY } from '../../src/common/constants';
import { protoTimestamp } from '../../src/common/helpers';
import { CHAT_HISTORY_TYPE, HistoryItem } from '../../src/components/history';
import { ConnectionService } from '../../src/services/connection.service';
import { SessionStateService } from '../../src/services/session_state.service';
import { StateSerializationService } from '../../src/services/wrappers/state_serialization.service';
import { setTimeoutMock } from '../helpers';

const expectedState = {
  state: v4(),
  creationTime: protoTimestamp(),
  version: {
    interactionId: v4(),
  },
};

beforeEach(() => {
  sessionStorage.clear();
});

test('should clear', () => {
  const connection = new ConnectionService();
  const stateSerialization = new StateSerializationService(connection);
  const service = new SessionStateService(connection, stateSerialization);

  const removeItem = jest.spyOn(
    Object.getPrototypeOf(sessionStorage),
    'removeItem',
  );

  service.clear();

  expect(removeItem).toHaveBeenCalledWith(DEFAULT_SESSION_STATE_KEY);
  expect(removeItem).toHaveBeenCalledTimes(1);
});

test('should destroy', () => {
  const connection = new ConnectionService();
  const stateSerialization = new StateSerializationService(connection);
  const service = new SessionStateService(connection, stateSerialization);

  const clear = jest.spyOn(service, 'clear');
  const removeEventListener = jest.spyOn(window, 'removeEventListener');

  service.destroy();

  expect(clear).toHaveBeenCalledTimes(1);

  expect(removeEventListener).toHaveBeenCalledTimes(2);
  expect(removeEventListener).toHaveBeenCalledWith('blur', expect.anything());
  expect(removeEventListener).toHaveBeenCalledWith('focus', expect.anything());
});

test('should load session state', () => {
  const getItem = jest.spyOn(Object.getPrototypeOf(sessionStorage), 'getItem');

  SessionStateService.loadSessionState();

  expect(getItem).toHaveBeenCalledWith(DEFAULT_SESSION_STATE_KEY);
  expect(getItem).toHaveBeenCalledTimes(1);
});

test('should blur with empty history', async () => {
  const connection = new ConnectionService();
  const stateSerialization = new StateSerializationService(connection);

  expect(sessionStorage.getItem(DEFAULT_SESSION_STATE_KEY)).toBeFalsy();

  new SessionStateService(connection, stateSerialization);

  window.dispatchEvent(new Event('blur'));

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(sessionStorage.getItem(DEFAULT_SESSION_STATE_KEY)).toBeFalsy();
});

test('should save history from the 1st attempt', async () => {
  jest.spyOn(ConnectionService.prototype, 'getHistory').mockReturnValue([
    {
      interactionId: v4(),
      type: CHAT_HISTORY_TYPE.INTERACTION_END,
    } as HistoryItem,
  ]);
  jest.spyOn(global, 'setTimeout').mockImplementationOnce(setTimeoutMock);
  jest
    .spyOn(StateSerializationService.prototype, 'get')
    .mockImplementationOnce(() => Promise.resolve(expectedState));

  expect(sessionStorage.getItem(DEFAULT_SESSION_STATE_KEY)).toBeFalsy();

  const connection = new ConnectionService();
  const stateSerialization = new StateSerializationService(connection);

  new SessionStateService(connection, stateSerialization);

  window.dispatchEvent(new Event('blur'));

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(sessionStorage.getItem(DEFAULT_SESSION_STATE_KEY)).toBe(
    JSON.stringify(expectedState),
  );
});

test('should save history from the last attempt', async () => {
  jest.spyOn(ConnectionService.prototype, 'getHistory').mockReturnValue([
    {
      interactionId: v4(),
      type: CHAT_HISTORY_TYPE.ACTOR,
    } as HistoryItem,
  ]);
  jest
    .spyOn(global, 'setTimeout')
    .mockImplementationOnce(setTimeoutMock)
    .mockImplementationOnce(setTimeoutMock)
    .mockImplementationOnce(setTimeoutMock)
    .mockImplementationOnce(setTimeoutMock);
  jest
    .spyOn(StateSerializationService.prototype, 'get')
    .mockImplementationOnce(() => Promise.resolve(expectedState));

  expect(sessionStorage.getItem(DEFAULT_SESSION_STATE_KEY)).toBeFalsy();

  const connection = new ConnectionService();
  const stateSerialization = new StateSerializationService(connection);

  new SessionStateService(connection, stateSerialization);

  window.dispatchEvent(new Event('blur'));

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(sessionStorage.getItem(DEFAULT_SESSION_STATE_KEY)).toBe(
    JSON.stringify(expectedState),
  );
});

test('should focus', () => {
  const connection = new ConnectionService();
  const stateSerialization = new StateSerializationService(connection);
  new SessionStateService(connection, stateSerialization);

  window.dispatchEvent(new Event('focus'));
});
