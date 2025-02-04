import {
  PerceivedLatencyReport as ProtoPerceivedLatencyReport,
  PerceivedLatencyReportPrecision as ProtoPerceivedLatencyReportPrecision,
} from '../../../../proto/ai/inworld/packets/packets.pb';

export enum PerceivedLatencyReportPrecisionType {
  UNSPECIFIED = 'UNSPECIFIED',
  FINE = 'FINE',
  ESTIMATED = 'ESTIMATED',
  PUSH_TO_TALK = 'PUSH_TO_TALK',
  NON_SPEECH = 'NON_SPEECH',
}

export class PerceivedLatencyReport {
  readonly latency: number;
  readonly precision: PerceivedLatencyReportPrecisionType;

  constructor({
    latency,
    precision,
  }: {
    latency: number;
    precision: PerceivedLatencyReportPrecisionType;
  }) {
    this.latency = latency;
    this.precision = precision;
  }

  static fromProto(proto: ProtoPerceivedLatencyReport) {
    return new PerceivedLatencyReport({
      latency: parseInt(proto.latency),
      precision: PerceivedLatencyReport.getPerceivedLatencyReportPrecision(
        proto.precision,
      ),
    });
  }

  static getPerceivedLatencyReportPrecision(
    precision: ProtoPerceivedLatencyReportPrecision,
  ) {
    switch (precision) {
      case ProtoPerceivedLatencyReportPrecision.FINE:
        return PerceivedLatencyReportPrecisionType.FINE;
      case ProtoPerceivedLatencyReportPrecision.ESTIMATED:
        return PerceivedLatencyReportPrecisionType.ESTIMATED;
      case ProtoPerceivedLatencyReportPrecision.PUSH_TO_TALK:
        return PerceivedLatencyReportPrecisionType.PUSH_TO_TALK;
      case ProtoPerceivedLatencyReportPrecision.NON_SPEECH:
        return PerceivedLatencyReportPrecisionType.NON_SPEECH;
      default:
        return PerceivedLatencyReportPrecisionType.UNSPECIFIED;
    }
  }

  static getProtoPerceivedLatencyReportPrecision(
    precision: PerceivedLatencyReportPrecisionType,
  ) {
    switch (precision) {
      case PerceivedLatencyReportPrecisionType.FINE:
        return ProtoPerceivedLatencyReportPrecision.FINE;
      case PerceivedLatencyReportPrecisionType.ESTIMATED:
        return ProtoPerceivedLatencyReportPrecision.ESTIMATED;
      case PerceivedLatencyReportPrecisionType.PUSH_TO_TALK:
        return ProtoPerceivedLatencyReportPrecision.PUSH_TO_TALK;
      case PerceivedLatencyReportPrecisionType.NON_SPEECH:
        return ProtoPerceivedLatencyReportPrecision.NON_SPEECH;
      default:
        return ProtoPerceivedLatencyReportPrecision.UNSPECIFIED;
    }
  }
}
