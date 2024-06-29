import { v4 } from 'uuid';

import { EntityItem } from '../../../src/entities/entities/entity_item';

test('should get entity item fields', () => {
  const id = v4();
  const displayName = v4();
  const description = v4();
  const properties = {
    key1: v4(),
    key2: v4(),
  };
  const item = new EntityItem({
    id,
    displayName,
    description,
    properties,
  });

  expect(item.id).toEqual(id);
  expect(item.displayName).toEqual(displayName);
  expect(item.description).toEqual(description);
  expect(item.properties).toEqual(properties);
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
    id,
    displayName,
    description,
    properties,
  };

  const item = EntityItem.fromProto(proto);

  expect(item.id).toEqual(id);
  expect(item.displayName).toEqual(displayName);
  expect(item.description).toEqual(description);
  expect(item.properties).toEqual(properties);
});

test('should convert to proto', () => {
  const id = v4();
  const displayName = v4();
  const description = v4();
  const properties = {
    key1: v4(),
    key2: v4(),
  };

  const item = new EntityItem({
    id,
    displayName,
    description,
    properties,
  });

  const proto = item.toProto();

  expect(proto.id).toEqual(id);
  expect(proto.displayName).toEqual(displayName);
  expect(proto.description).toEqual(description);
  expect(proto.properties).toEqual(properties);
});
