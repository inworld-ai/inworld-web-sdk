import { PingPongReportType as ProtoPingPongReportType } from '../../../../proto/ai/inworld/packets/packets.pb';

export enum PingPongType {
  // No type is specified, means this is empty report.
  UNSPECIFIED = 'UNSPECIFIED',
  // Sent from the server to the client.
  PING = 'PING',
  // Upon receiving a ping, the client has to send back a pong packet.
  PONG = 'PONG',
}

export class PingPongReportType {
  readonly type: PingPongType;

  constructor(type: PingPongType) {
    this.type = type;
  }

  static fromProto(type: ProtoPingPongReportType) {
    switch (type) {
      case ProtoPingPongReportType.UNSPECIFIED:
        return PingPongType.UNSPECIFIED;
      case ProtoPingPongReportType.PING:
        return PingPongType.PING;
      case ProtoPingPongReportType.PONG:
        return PingPongType.PONG;
      default:
        return PingPongType.UNSPECIFIED;
    }
  }
}
