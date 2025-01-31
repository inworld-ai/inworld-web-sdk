import {
  PingPongReport as ProtoPingPongReport,
  PingPongReportType as ProtoPingPongReportType,
} from '../../../../proto/ai/inworld/packets/packets.pb';
import { PacketId } from '../packet_id.entity';

export enum PingPongType {
  // No type is specified, means this is empty report.
  UNSPECIFIED = 'UNSPECIFIED',
  // Sent from the server to the client.
  PING = 'PING',
  // Upon receiving a ping, the client has to send back a pong packet.
  PONG = 'PONG',
}

export class PingPongReport {
  readonly packetId: PacketId | null;
  readonly pingTimestamp: string;
  readonly type: PingPongType;

  constructor({
    packetId,
    pingTimestamp,
    type,
  }: {
    packetId: PacketId | null;
    pingTimestamp: string;
    type: PingPongType;
  }) {
    this.packetId = packetId;
    this.pingTimestamp = pingTimestamp;
    this.type = type;
  }

  static fromProto(proto: ProtoPingPongReport) {
    return new PingPongReport({
      packetId: proto.pingPacketId
        ? PacketId.fromProto(proto.pingPacketId)
        : null,
      pingTimestamp: proto.pingTimestamp.toString(),
      type: PingPongReport.getType(proto.type),
    });
  }

  static getType(type: ProtoPingPongReportType) {
    switch (type) {
      case ProtoPingPongReportType.PING:
        return PingPongType.PING;
      case ProtoPingPongReportType.PONG:
        return PingPongType.PONG;
      default:
        return PingPongType.UNSPECIFIED;
    }
  }
}
