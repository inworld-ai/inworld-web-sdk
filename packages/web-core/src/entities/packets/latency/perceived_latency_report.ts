import { PerceivedLatencyReport as ProtoPerceivedLatencyReport } from '../../../../proto/ai/inworld/packets/packets.pb';
import { PerceivedLatencyReportPrecision } from './perceived_latency_report_precision.entity';

export class PerceivedLatencyReport {
  readonly latency: number;
  readonly precision: PerceivedLatencyReportPrecision;

  constructor({
    latency,
    precision,
  }: {
    latency: number;
    precision: PerceivedLatencyReportPrecision;
  }) {
    this.latency = latency;
    this.precision = precision;
  }

  static fromProto(proto: ProtoPerceivedLatencyReport) {
    return new PerceivedLatencyReport({
      latency: parseInt(proto.latency),
      precision: new PerceivedLatencyReportPrecision(
        PerceivedLatencyReportPrecision.fromProto(proto.precision),
      ),
    });
  }
}
