import { QueueItem } from '../../src/connection/web-socket.connection';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';

export * from './conversation';
export * from './extension';
export * from './extension';
export * from './packet';
export * from './scene';
export * from './token';

export const writeMock = async (item: QueueItem<InworldPacket>) => {
  const packet = InworldPacket.fromProto(item.getPacket());
  await item.beforeWriting?.(packet);
  item.afterWriting?.(packet);
};

export const setNavigatorProperty = (key: string, value: any) => {
  Object.defineProperty(navigator, key, {
    value,
    configurable: true,
  });
};

export const setTimeoutMock = (callback: any) => {
  if (typeof callback === 'function') {
    callback();
  }

  return { hasRef: () => false } as NodeJS.Timeout;
};
