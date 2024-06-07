import { v4 } from 'uuid';

import {
  ConversationEventPayloadConversationEventType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import { EventFactory } from '../../src/factories/event';

const eventFactory = new EventFactory();

export const conversationId = v4();
export const conversationUpdated = {
  ...eventFactory.baseProtoPacket({ conversationId }),
  control: {
    conversationEvent: {
      eventType: ConversationEventPayloadConversationEventType.UPDATED,
    },
  },
} as ProtoPacket;
