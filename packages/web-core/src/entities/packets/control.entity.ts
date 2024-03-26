import {
  ControlEvent as ProtoControlEvent,
  ControlEventAction,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { InworlControlType } from '../../common/data_structures';

export class ControlEvent {
  readonly type: InworlControlType;
  readonly description: string | undefined;

  constructor({
    type,
    description,
  }: {
    type: InworlControlType;
    description?: string;
  }) {
    this.type = type;
    this.description = description;
  }

  static fromProto(proto: ProtoControlEvent) {
    return new ControlEvent({
      type: this.getControlType(proto),
      description: proto.description,
    });
  }

  private static getControlType(proto: ProtoControlEvent) {
    switch (proto.action) {
      case ControlEventAction.INTERACTION_END:
        return InworlControlType.INTERACTION_END;
      case ControlEventAction.TTS_PLAYBACK_START:
        return InworlControlType.TTS_PLAYBACK_START;
      case ControlEventAction.TTS_PLAYBACK_END:
        return InworlControlType.TTS_PLAYBACK_END;
      case ControlEventAction.TTS_PLAYBACK_MUTE:
        return InworlControlType.TTS_PLAYBACK_MUTE;
      case ControlEventAction.TTS_PLAYBACK_UNMUTE:
        return InworlControlType.TTS_PLAYBACK_UNMUTE;
      case ControlEventAction.WARNING:
        return InworlControlType.WARNING;
      default:
        return InworlControlType.UNKNOWN;
    }
  }
}
