import { LatencyReportEvent as ProtoLatencyReportEvent } from '../../../../proto/ai/inworld/packets/packets.pb';
import { PerceivedLatencyReport } from './perceived_latency_report';
import { PingPongReport } from './ping_pong_report.entity';

export class LatencyReportEvent {
  readonly pingPong?: PingPongReport;
  readonly perceivedLatency?: PerceivedLatencyReport;

  constructor({
    pingPong,
    perceivedLatency,
  }: {
    pingPong?: PingPongReport;
    perceivedLatency?: PerceivedLatencyReport;
  }) {
    if (pingPong) {
      this.pingPong = pingPong;
    }

    if (perceivedLatency) {
      this.perceivedLatency = perceivedLatency;
    }
  }

  static fromProto(proto: ProtoLatencyReportEvent) {
    return new LatencyReportEvent({
      ...(proto.pingPong && {
        pingPong: PingPongReport.fromProto(proto.pingPong),
      }),
      ...(proto.perceivedLatency && {
        perceivedLatency: PerceivedLatencyReport.fromProto(
          proto.perceivedLatency,
        ),
      }),
    });
  }
}
