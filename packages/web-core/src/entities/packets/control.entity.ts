import {
  ControlEvent as ProtoControlEvent,
  ControlEventAction,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { InworlControlType } from '../../common/data_structures';

export class ControlEvent {
  readonly type: InworlControlType;

  constructor({ type }: { type: InworlControlType }) {
    this.type = type;
  }

  static fromProto(proto: ProtoControlEvent) {
    return new ControlEvent({
      type: this.getControlType(proto),
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
      default:
        return InworlControlType.UNKNOWN;
    }
  }
}
