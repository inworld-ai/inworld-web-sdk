import { PingPongReport as ProtoPingPongReport } from '../../../../proto/ai/inworld/packets/packets.pb';
import { PacketId } from '../packet_id.entity';
import { PingPongReportType } from './ping_pong_report_type.entity';

export class PingPongReport {
  readonly packeId: PacketId | null;
  readonly pingTimestamp: string;
  readonly type: PingPongReportType;

  constructor({
    packetId,
    pingTimestamp,
    type,
  }: {
    packetId: PacketId | null;
    pingTimestamp: string;
    type: PingPongReportType;
  }) {
    this.packeId = packetId;
    this.pingTimestamp = pingTimestamp;
    this.type = type;
  }

  static fromProto(proto: ProtoPingPongReport) {
    return new PingPongReport({
      packetId: proto.pingPacketId
        ? PacketId.fromProto(proto.pingPacketId)
        : null,
      pingTimestamp: proto.pingTimestamp.toString(),
      type: new PingPongReportType(PingPongReportType.fromProto(proto.type)),
    });
  }
}
