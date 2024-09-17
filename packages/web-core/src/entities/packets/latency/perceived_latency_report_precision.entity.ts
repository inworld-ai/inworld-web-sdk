import { PerceivedLatencyReportPrecision as ProtoPerceivedLatencyReportPrecision } from '../../../../proto/ai/inworld/packets/packets.pb';

export enum PerceivedLatencyReportPrecisionType {
  UNSPECIFIED = 'UNSPECIFIED',
  FINE = 'FINE',
  ESTIMATED = 'ESTIMATED',
  PUSH_TO_TALK = 'PUSH_TO_TALK',
  NON_SPEECH = 'NON_SPEECH',
}

export class PerceivedLatencyReportPrecision {
  readonly precision: PerceivedLatencyReportPrecisionType;

  constructor(precision: PerceivedLatencyReportPrecisionType) {
    this.precision = precision;
  }

  static fromProto(precision: ProtoPerceivedLatencyReportPrecision) {
    switch (precision) {
      case ProtoPerceivedLatencyReportPrecision.UNSPECIFIED:
        return PerceivedLatencyReportPrecisionType.UNSPECIFIED;
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
}
