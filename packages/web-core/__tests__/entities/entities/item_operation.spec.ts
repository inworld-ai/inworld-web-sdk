import { v4 } from 'uuid';

import { ItemsInEntitiesOperationType } from '../../../src/common/data_structures';
import { EntityItem } from '../../../src/entities/entities/entity_item';
import { ItemOperation } from '../../../src/entities/entities/item_operation';

test('should get create or update', () => {
  const createOrUpdateItems = {
    items: [
      new EntityItem({
        id: v4(),
        displayName: v4(),
        description: v4(),
        properties: {
          key1: v4(),
          key2: v4(),
        },
      }),
      new EntityItem({
        id: v4(),
        displayName: v4(),
        description: v4(),
        properties: {
          key1: v4(),
          key2: v4(),
        },
      }),
    ],
    addToEntities: [v4(), v4()],
  };

  const itemOperation = new ItemOperation({
    createOrUpdateItems,
  });

  expect(itemOperation.createOrUpdateItems?.addToEntities).toEqual(
    createOrUpdateItems.addToEntities,
  );
  expect(itemOperation.createOrUpdateItems?.items).toEqual(
    createOrUpdateItems.items,
  );
});

test('should get remove items', () => {
  const removeItems = {
    itemIds: [v4(), v4()],
  };

  const itemOperation = new ItemOperation({
    removeItems,
  });

  expect(itemOperation.removeItems?.itemIds).toEqual(removeItems.itemIds);
});

test('should get items in entities', () => {
  const itemsInEntities = {
    type: ItemsInEntitiesOperationType.ADD,
    itemIds: [v4(), v4()],
    entityNames: [v4(), v4()],
  };

  const itemOperation = new ItemOperation({
    itemsInEntities,
  });

  expect(itemOperation.itemsInEntities?.type).toEqual(itemsInEntities.type);
  expect(itemOperation.itemsInEntities?.itemIds).toEqual(
    itemsInEntities.itemIds,
  );
  expect(itemOperation.itemsInEntities?.entityNames).toEqual(
    itemsInEntities.entityNames,
  );
});

test('should convert from proto', () => {
  const id = v4();
  const displayName = v4();
  const description = v4();
  const properties = {
    key1: v4(),
    key2: v4(),
  };

  const proto = {
    createOrUpdateItems: {
      items: [
        {
          id,
          displayName,
          description,
          properties,
        },
        {
          id,
          displayName,
          description,
          properties,
        },
      ],
      addToEntities: [v4(), v4()],
    },
  };

  const itemOperation = ItemOperation.fromProto(proto);

  expect(itemOperation.createOrUpdateItems?.addToEntities).toEqual(
    proto.createOrUpdateItems?.addToEntities,
  );
  expect(itemOperation.createOrUpdateItems?.items).toEqual(
    proto.createOrUpdateItems?.items,
  );
});

test('should convert to proto', () => {
  const id = v4();
  const displayName = v4();
  const description = v4();
  const properties = {
    key1: v4(),
    key2: v4(),
  };

  const itemOperation = new ItemOperation({
    createOrUpdateItems: {
      items: [
        new EntityItem({
          id,
          displayName,
          description,
          properties,
        }),
        new EntityItem({
          id,
          displayName,
          description,
          properties,
        }),
      ],
      addToEntities: [v4(), v4()],
    },
  });

  const proto = itemOperation.toProto();

  expect(proto.createOrUpdateItems?.addToEntities).toEqual(
    itemOperation.createOrUpdateItems?.addToEntities,
  );
  expect(proto.createOrUpdateItems?.items).toEqual(
    itemOperation.createOrUpdateItems?.items?.map((item) => item.toProto()),
  );
});
