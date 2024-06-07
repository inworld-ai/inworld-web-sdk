import { InworldPacket as ProtoPacket } from '../../proto/ai/inworld/packets/packets.pb';
import { Extension } from '../../src/common/data_structures';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { ExtendedHistoryItem, ExtendedInworldPacket } from '../data_structures';

const beforeLoadScene = (packets: ProtoPacket[]) => {
  return packets.map((packet: ProtoPacket) => {
    if (packet.control?.sessionConfiguration?.capabilitiesConfiguration) {
      packet.control.sessionConfiguration.capabilitiesConfiguration = {
        ...packet.control.sessionConfiguration.capabilitiesConfiguration,
        regenerateResponse: true,
      };
    }

    return packet;
  });
};

export const convertPacketFromProto = (proto: ProtoPacket) => {
  const packet = InworldPacket.fromProto(proto) as ExtendedInworldPacket;

  packet.mutation = proto.mutation!;

  return packet;
};

export const simpleExtension: Extension<ExtendedInworldPacket> = {
  convertPacketFromProto,
};

export const extension: Extension<ExtendedInworldPacket, ExtendedHistoryItem> =
  {
    convertPacketFromProto,
    afterLoadScene: jest.fn(),
    beforeLoadScene: jest.fn().mockImplementation(beforeLoadScene),
  };
