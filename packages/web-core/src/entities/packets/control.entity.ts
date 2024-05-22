import {
  ControlEvent as ProtoControlEvent,
  ControlEventAction,
  ConversationEventPayloadConversationEventType,
} from '../../../proto/ai/inworld/packets/packets.pb';
import {
  InworlControlAction,
  InworldConversationEventType,
} from '../../common/data_structures';
import { Actor } from './routing.entity';

export interface Conversation {
  type?: InworldConversationEventType;
  participants: Actor[];
}

export class ControlEvent {
  readonly action: InworlControlAction;
  readonly description: string | undefined;
  readonly conversation: Conversation | undefined;

  constructor({
    action,
    description,
    conversation,
  }: {
    action: InworlControlAction;
    description?: string;
    conversation?: Conversation;
  }) {
    this.action = action;

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
}
