import {
  AudioSessionStartPayload,
  AudioSessionStartPayloadMicrophoneMode,
  AudioSessionStartPayloadUnderstandingMode,
  ControlEvent as ProtoControlEvent,
  ControlEventAction,
  ConversationEventPayloadConversationEventType,
} from '../../../proto/ai/inworld/packets/packets.pb';
import {
  InworlControlAction,
  InworldConversationEventType,
  MicrophoneMode,
  UnderstandingMode,
} from '../../common/data_structures';
import { Actor } from './routing.entity';

export interface Conversation {
  type?: InworldConversationEventType;
  participants: Actor[];
}

export interface AudioSessionStart {
  mode?: MicrophoneMode;
  understandingMode?: UnderstandingMode;
}

export class ControlEvent {
  readonly action: InworlControlAction;
  readonly audioSessionStart?: AudioSessionStart;
  readonly description?: string;
  readonly conversation?: Conversation;

  constructor({
    action,
    audioSessionStart,
    description,
    conversation,
  }: {
    action: InworlControlAction;
    audioSessionStart?: AudioSessionStart;
    description?: string;
    conversation?: Conversation;
  }) {
    this.action = action;

    if (audioSessionStart) {
      this.audioSessionStart = audioSessionStart;
    }

    if (description) {
      this.description = description;
    }

    if (conversation) {
      this.conversation = conversation;
    }
  }

  static fromProto(proto: ProtoControlEvent) {
    const conversation = proto.conversationUpdate ?? proto.conversationEvent;

    return new ControlEvent({
      action: this.getControlType(proto),
      ...(proto.audioSessionStart && {
        audioSessionStart: {
          mode: ControlEvent.getMicrophoneMode(proto.audioSessionStart),
          understandingMode: ControlEvent.getUnderstandingMode(
            proto.audioSessionStart,
          ),
        },
      }),
      description: proto.description,
      ...(conversation && {
        conversation: {
          ...(proto.conversationEvent && {
            type: this.getConversationType(proto),
          }),
          participants:
            conversation.participants?.map((participant) =>
              Actor.fromProto(participant),
            ) ?? [],
        },
      }),
    });
  }

  private static getControlType(proto: ProtoControlEvent) {
    switch (proto.action) {
      case ControlEventAction.AUDIO_SESSION_START:
        return InworlControlAction.AUDIO_SESSION_START;
      case ControlEventAction.AUDIO_SESSION_END:
        return InworlControlAction.AUDIO_SESSION_END;
      case ControlEventAction.INTERACTION_END:
        return InworlControlAction.INTERACTION_END;
      case ControlEventAction.TTS_PLAYBACK_MUTE:
        return InworlControlAction.TTS_PLAYBACK_MUTE;
      case ControlEventAction.TTS_PLAYBACK_UNMUTE:
        return InworlControlAction.TTS_PLAYBACK_UNMUTE;
      case ControlEventAction.WARNING:
        return InworlControlAction.WARNING;
      case ControlEventAction.CONVERSATION_UPDATE:
        return InworlControlAction.CONVERSATION_UPDATE;
      case ControlEventAction.CONVERSATION_EVENT:
        return InworlControlAction.CONVERSATION_EVENT;
      default:
        return InworlControlAction.UNKNOWN;
    }
  }

  private static getConversationType(proto: ProtoControlEvent) {
    switch (proto.conversationEvent.eventType) {
      case ConversationEventPayloadConversationEventType.STARTED:
        return InworldConversationEventType.STARTED;
      case ConversationEventPayloadConversationEventType.UPDATED:
        return InworldConversationEventType.UPDATED;
      case ConversationEventPayloadConversationEventType.EVICTED:
        return InworldConversationEventType.EVICTED;
      default:
        return InworldConversationEventType.UNKNOWN;
    }
  }

  private static getMicrophoneMode(proto: AudioSessionStartPayload) {
    if (
      proto.mode === AudioSessionStartPayloadMicrophoneMode.EXPECT_AUDIO_END
    ) {
      return MicrophoneMode.EXPECT_AUDIO_END;
    }

    return MicrophoneMode.OPEN_MIC;
  }

  private static getUnderstandingMode(proto: AudioSessionStartPayload) {
    if (
      proto.understandingMode ===
      AudioSessionStartPayloadUnderstandingMode.SPEECH_RECOGNITION_ONLY
    ) {
      return UnderstandingMode.SPEECH_RECOGNITION_ONLY;
    }

    return UnderstandingMode.FULL;
  }
}
