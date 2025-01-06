import { v4 } from 'uuid';

import { TaskEvent } from '../../../src/entities/packets/task.entity';

test('should get fields', () => {
  const name = v4();
  const parameters = [
    {
      name: v4(),
      value: v4(),
    },
  ];
  const task = new TaskEvent({
    name,
    parameters,
  });

  expect(task.name).toEqual(name);
  expect(task.parameters).toEqual(parameters);
});

test('shoulf get fields without parameters', () => {
  const name = v4();
  const task = new TaskEvent({
    name,
  });

  expect(task.name).toEqual(name);
  expect(task.parameters).toBeUndefined();
});

test('should convert from proto', () => {
  const proto = {
    name: v4(),
    parameters: [
      {
        name: v4(),
        value: v4(),
      },
    ],
  };
  const packet = TaskEvent.fromProto(proto);

  expect(packet.name).toEqual(proto.name);
  expect(packet.parameters).toEqual(packet.parameters);
});

test('should convert from proto without parameters', () => {
  const proto = { name: v4() };
  const packet = TaskEvent.fromProto(proto);

  expect(packet.name).toEqual(proto.name);
  expect(packet.parameters).toBeUndefined();
});
