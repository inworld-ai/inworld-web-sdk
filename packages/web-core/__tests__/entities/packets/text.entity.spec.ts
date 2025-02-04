import { v4 } from 'uuid';

import {
  TextEvent as ProtoTextEvent,
  TextEventSourceType as ProtoTextEventSourceType,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { InworldTextPacketType } from '../../../src/common/data_structures';
import { TextEvent } from '../../../src/entities/packets/text.entity';

test.each([
  {
    input: ProtoTextEventSourceType.SPEECH_TO_TEXT,
    expected: InworldTextPacketType.SPEECH_TO_TEXT,
  },
  {
    input: ProtoTextEventSourceType.TYPED_IN,
    expected: InworldTextPacketType.TYPED_IN,
  },
  {
    input: ProtoTextEventSourceType.GENERATED,
    expected: InworldTextPacketType.GENERATED,
  },
  {
    input: ProtoTextEventSourceType.FILLER,
    expected: InworldTextPacketType.FILLER,
  },
  {
    input: undefined,
    expected: InworldTextPacketType.UNKNOWN,
  },
])('should convert text event for $expected', ({ input, expected }) => {
  const text = v4();

  const proto = {
    sourceType: input,
    text,
    final: true,
  } as ProtoTextEvent;

  expect(TextEvent.fromProto(proto)).toEqual({
    text,
    final: true,
    type: expected,
  });
});
