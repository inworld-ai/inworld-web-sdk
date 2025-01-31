import { v4 } from 'uuid';

import {
  PingPongReport as ProtoPingPongReport,
  PingPongReportType as ProtoPingPongReportType,
} from '../../../../proto/ai/inworld/packets/packets.pb';
import { protoTimestamp } from '../../../../src/common/helpers';
import {
  PingPongReport,
  PingPongType,
} from '../../../../src/entities/packets/latency/ping_pong_report.entity';

test.each([
  {
    input: ProtoPingPongReportType.PING,
    expected: PingPongType.PING,
  },
  {
    input: ProtoPingPongReportType.PONG,
    expected: PingPongType.PONG,
  },
  {
    input: undefined,
    expected: PingPongType.UNSPECIFIED,
  },
])('should convert ping pong latency for $expected', ({ input, expected }) => {
  const packetId = v4();
  const pingTimestamp = protoTimestamp();
  const proto = {
    type: input,
    pingPacketId: { packetId },
    pingTimestamp,
  } as ProtoPingPongReport;

  expect(PingPongReport.fromProto(proto)).toEqual({
    type: expected,
    packetId: { packetId },
    pingTimestamp: pingTimestamp,
  });
});

test('should convert ping pong latency for empty packetId', () => {
  const pingTimestamp = protoTimestamp();
  const proto = {
    type: ProtoPingPongReportType.PING,
    pingTimestamp,
  } as ProtoPingPongReport;

  expect(PingPongReport.fromProto(proto)).toEqual({
    type: PingPongType.PING,
    packetId: null,
    pingTimestamp: pingTimestamp,
  });
});
