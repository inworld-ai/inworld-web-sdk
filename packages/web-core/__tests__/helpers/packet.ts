import { v4 } from 'uuid';

import {
  InworlControlAction,
  InworldPacketType,
} from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import { Character } from '../../src/entities/character.entity';
import { ControlEvent } from '../../src/entities/packets/control.entity';
import {
  EmotionBehavior,
  EmotionBehaviorCode,
} from '../../src/entities/packets/emotion/emotion_behavior.entity';
import {
  EmotionStrength,
  EmotionStrengthCode,
} from '../../src/entities/packets/emotion/emotion_strength.entity';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { NarratedAction } from '../../src/entities/packets/narrated_action.entity';
import { PacketId } from '../../src/entities/packets/packet_id.entity';
import { TriggerEvent } from '../../src/entities/packets/trigger.entity';

export const getRouting = (character: Character) => ({
  source: {
    name: v4(),
    isPlayer: true,
    isCharacter: false,
  },
  targets: [
    {
      name: character.id,
      isPlayer: false,
      isCharacter: true,
    },
  ],
});

export const getPacketId = () =>
  new PacketId({
    packetId: v4(),
    interactionId: v4(),
    utteranceId: v4(),
  });

export const getTextPacket = (props: {
  character: Character;
  text?: string;
  packetId?: PacketId;
}) =>
  new InworldPacket({
    packetId: props.packetId ?? getPacketId(),
    routing: getRouting(props.character),
    date: protoTimestamp(),
    text: {
      text: props.text ?? v4(),
      final: false,
    },
    type: InworldPacketType.TEXT,
  });

export const getTriggerPacket = (props: {
  character: Character;
  trigger?: TriggerEvent;
  packetId?: PacketId;
}) =>
  new InworldPacket({
    packetId: props.packetId ?? getPacketId(),
    routing: getRouting(props.character),
    date: protoTimestamp(),
    trigger: props.trigger ?? {
      name: v4(),
      parameters: [{ name: v4(), value: v4() }],
    },
    type: InworldPacketType.TRIGGER,
  });

export const getNarratedActionPacket = (props: {
  character: Character;
  action?: NarratedAction;
  packetId?: PacketId;
}) =>
  new InworldPacket({
    packetId: props.packetId ?? getPacketId(),
    routing: getRouting(props.character),
    date: protoTimestamp(),
    narratedAction: props?.action ?? { text: v4() },
    type: InworldPacketType.NARRATED_ACTION,
  });

export const getEmotionPacket = (props: {
  character: Character;
  packetId?: PacketId;
}) =>
  new InworldPacket({
    packetId: props.packetId ?? getPacketId(),
    routing: getRouting(props.character),
    date: protoTimestamp(),
    emotions: {
      behavior: new EmotionBehavior(EmotionBehaviorCode.NEUTRAL),
      strength: new EmotionStrength(EmotionStrengthCode.NORMAL),
    },
    type: InworldPacketType.EMOTION,
  });

export const getInteractionEndPacket = (props: {
  character: Character;
  packetId?: PacketId;
}) =>
  new InworldPacket({
    packetId: props.packetId ?? getPacketId(),
    routing: getRouting(props.character),
    date: protoTimestamp(),
    type: InworldPacketType.CONTROL,
    control: new ControlEvent({
      action: InworlControlAction.INTERACTION_END,
    }),
  });
