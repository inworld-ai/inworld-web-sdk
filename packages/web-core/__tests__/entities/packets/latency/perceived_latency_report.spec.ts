import {
  PerceivedLatencyReport as ProtoPerceivedLatencyReport,
  PerceivedLatencyReportPrecision as ProtoPerceivedLatencyReportPrecision,
} from '../../../../proto/ai/inworld/packets/packets.pb';
import {
  PerceivedLatencyReport,
  PerceivedLatencyReportPrecisionType,
} from '../../../../src/entities/packets/latency/perceived_latency_report.entity';

test.each([
  {
    input: ProtoPerceivedLatencyReportPrecision.FINE,
    expected: PerceivedLatencyReportPrecisionType.FINE,
  },
  {
    input: ProtoPerceivedLatencyReportPrecision.ESTIMATED,
    expected: PerceivedLatencyReportPrecisionType.ESTIMATED,
  },
  {
    input: ProtoPerceivedLatencyReportPrecision.PUSH_TO_TALK,
    expected: PerceivedLatencyReportPrecisionType.PUSH_TO_TALK,
  },
  {
    input: ProtoPerceivedLatencyReportPrecision.NON_SPEECH,
    expected: PerceivedLatencyReportPrecisionType.NON_SPEECH,
  },
  {
    input: undefined,
    expected: PerceivedLatencyReportPrecisionType.UNSPECIFIED,
  },
])(
  'should convert proto perceived latency for $expected',
  ({ input, expected }) => {
    const latency = 1;
    const proto = {
      precision: input,
      latency,
    } as ProtoPerceivedLatencyReport;

    expect(PerceivedLatencyReport.fromProto(proto)).toEqual({
      latency,
      precision: expected,
    });
  },
);

test.each([
  {
    input: PerceivedLatencyReportPrecisionType.FINE,
    expected: ProtoPerceivedLatencyReportPrecision.FINE,
  },
  {
    input: PerceivedLatencyReportPrecisionType.ESTIMATED,
    expected: ProtoPerceivedLatencyReportPrecision.ESTIMATED,
  },
  {
    input: PerceivedLatencyReportPrecisionType.PUSH_TO_TALK,
    expected: ProtoPerceivedLatencyReportPrecision.PUSH_TO_TALK,
  },
  {
    input: PerceivedLatencyReportPrecisionType.NON_SPEECH,
    expected: ProtoPerceivedLatencyReportPrecision.NON_SPEECH,
  },
  {
    input: undefined,
    expected: ProtoPerceivedLatencyReportPrecision.UNSPECIFIED,
  },
])(
  'should convert perceived latency persicion to proto one for $expected',
  ({ input, expected }) => {
    expect(
      PerceivedLatencyReport.getProtoPerceivedLatencyReportPrecision(input),
    ).toEqual(expected);
  },
);
