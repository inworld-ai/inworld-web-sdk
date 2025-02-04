import { v4 } from 'uuid';

import {
  LogsEvent as ProtoLogsEvent,
  LogsEventLogLevel as ProtoLogsEventLogLevel,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { LogLevel } from '../../../src/common/data_structures';
import { LogsEvent } from '../../../src/entities/packets/log.entity';

test.each([
  {
    input: ProtoLogsEventLogLevel.WARNING,
    expected: LogLevel.WARNING,
  },
  {
    input: ProtoLogsEventLogLevel.INFO,
    expected: LogLevel.INFO,
  },
  {
    input: ProtoLogsEventLogLevel.DEBUG,
    expected: LogLevel.DEBUG,
  },
  {
    input: ProtoLogsEventLogLevel.INTERNAL,
    expected: LogLevel.INTERNAL,
  },
  {
    input: undefined,
    expected: LogLevel.UNSPECIFIED,
  },
])('should convert log event for $expected', ({ input, expected }) => {
  const text = v4();
  const details = [{ text: v4() }];

  const proto = {
    level: input,
    text,
    details,
  } as ProtoLogsEvent;

  expect(LogsEvent.fromProto(proto)).toEqual({
    text,
    level: expected,
    details,
  });
});
