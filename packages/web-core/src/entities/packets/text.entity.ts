import {
  TextEvent as ProtoTextEvent,
  TextEventSourceType,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { InworldTextPacketType } from '../../common/data_structures';

export class TextEvent {
  readonly text: string;
  readonly final: boolean;
  readonly type?: InworldTextPacketType = InworldTextPacketType.TYPED_IN;

  constructor({
    text,
    final,
    type,
  }: {
    text: string;
    final: boolean;
    type?: InworldTextPacketType;
  }) {
    this.text = text;
    this.final = final;

    if (type) {
      this.type = type;
    }
  }

  static fromProto(proto: ProtoTextEvent) {
    return new TextEvent({
      text: proto.text,
      final: proto.final,
      type: TextEvent.getType(proto.sourceType),
    });
  }

  private static getType(protoType: TextEventSourceType) {
    switch (protoType) {
      case TextEventSourceType.SPEECH_TO_TEXT:
        return InworldTextPacketType.SPEECH_TO_TEXT;
      case TextEventSourceType.TYPED_IN:
        return InworldTextPacketType.TYPED_IN;
      case TextEventSourceType.GENERATED:
        return InworldTextPacketType.GENERATED;
      case TextEventSourceType.FILLER:
        return InworldTextPacketType.FILLER;
      default:
        return InworldTextPacketType.UNKNOWN;
    }
  }
}
