import '../mocks/window.mock';

import { v4 } from 'uuid';

import { ItemsInEntitiesOperationType } from '../../src/common/data_structures';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { GrpcWebRtcLoopbackBiDiSession } from '../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import { WebSocketConnection } from '../../src/connection/web-socket.connection';
import { EventFactory } from '../../src/factories/event';
import { ConnectionService } from '../../src/services/connection.service';
import { EntityService } from '../../src/services/entity.service';
import { generateSessionToken, SCENE, writeMock } from '../helpers';

let connection: ConnectionService;

beforeEach(() => {
  const grpcAudioPlayer = new GrpcAudioPlayback();
  const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();

  connection = new ConnectionService({
    name: SCENE,
    grpcAudioPlayer,
    webRtcLoopbackBiDiSession,
    generateSessionToken,
  });

  jest
    .spyOn(ConnectionService.prototype, 'isActive')
    .mockImplementation(() => true);
  jest
    .spyOn(WebSocketConnection.prototype, 'write')
    .mockImplementation(writeMock);
});

test('should create or update items', async () => {
  const createOrUpdateItems = jest.spyOn(
    EventFactory.prototype,
    'createOrUpdateItems',
  );

  const items = [
    {
      id: v4(),
      displayName: v4(),
      description: v4(),
      properties: {
        key1: v4(),
        key2: v4(),
      },
    },
    {
      id: v4(),
      displayName: v4(),
      description: v4(),
      properties: {
        key1: v4(),
        key2: v4(),
      },
    },
  ];
  const addToEntities = [v4(), v4()];

  await new EntityService(connection).createOrUpdateItems({
    items,
    addToEntities,
  });

  expect(createOrUpdateItems).toHaveBeenCalledTimes(1);
  expect(createOrUpdateItems).toHaveBeenCalledWith({ items, addToEntities });
});

test('should remove items', async () => {
  const removeItems = jest.spyOn(EventFactory.prototype, 'removeItems');

  const ids = [v4(), v4()];

  await new EntityService(connection).removeItems(ids);

  expect(removeItems).toHaveBeenCalledTimes(1);
  expect(removeItems).toHaveBeenCalledWith(ids);
});

test.each([
  ItemsInEntitiesOperationType.ADD,
  ItemsInEntitiesOperationType.REMOVE,
  ItemsInEntitiesOperationType.REPLACE,
])('shoud execute $type', async (type) => {
  const itemsInEntities = jest.spyOn(EventFactory.prototype, 'itemsInEntities');

  const itemIds = [v4(), v4()];
  const entityNames = [v4(), v4()];

  await new EntityService(connection).itemsInEntities({
    type,
    itemIds,
    entityNames,
  });

  expect(itemsInEntities).toHaveBeenCalledTimes(1);
  expect(itemsInEntities).toHaveBeenCalledWith({
    type,
    itemIds,
    entityNames,
  });
});
