import { v4 } from 'uuid';

import { UserRequest } from '../../proto/world-engine.pb';
import { DEFAULT_USER_NAME } from '../common/constants';
import { Character } from '../entities/character.entity';
import {
  Actor,
  EmotionEvent,
  InworldPacket,
} from '../entities/inworld_packet.entity';
import { GrpcAudioPlayback } from './sound/grpc_audio.playback';

interface InworldHistoryAddProps<InworldPacketT> {
  characters: Character[];
  grpcAudioPlayer: GrpcAudioPlayback;
  packet: InworldPacketT;
  outgoing?: boolean;
}

export enum CHAT_HISTORY_TYPE {
  ACTOR = 'actor',
  NARRATED_ACTION = 'narrated_action',
  TRIGGER_EVENT = 'trigger_event',
  INTERACTION_END = 'interaction_end',
}

export interface HistoryItemBase {
  date: Date;
  id: string;
  interactionId?: string;
  source: Actor;
  type: CHAT_HISTORY_TYPE;
}

export interface HistoryItemActor extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.ACTOR;
  text?: string;
  emotions?: EmotionEvent;
  isRecognizing?: boolean;
  character?: Character;
}

export interface HistoryItemTriggerEvent extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.TRIGGER_EVENT;
  name: string;
  outgoing?: boolean;
}

export interface HistoryInteractionEnd extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.INTERACTION_END;
}

export interface HistoryItemNarratedAction extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.NARRATED_ACTION;
  text?: string;
  character?: Character;
}

export type HistoryItem =
  | HistoryItemActor
  | HistoryItemTriggerEvent
  | HistoryInteractionEnd
  | HistoryItemNarratedAction;

interface EmotionsMap {
  [key: string]: EmotionEvent;
}

export class InworldHistory<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private history: HistoryItem[] = [];
  private queue: HistoryItem[] = [];
  private emotions: EmotionsMap = {};

  addOrUpdate({
    characters,
    grpcAudioPlayer,
    packet,
    outgoing,
  }: InworldHistoryAddProps<InworldPacketT>) {
    let chatItem: HistoryItem | undefined;

    const utteranceId = packet.packetId?.utteranceId;
    const interactionId = packet.packetId?.interactionId;

    const id = packet.routing?.source?.isCharacter
      ? packet.routing?.source?.name
      : packet.routing?.target?.name;
    const character = characters.find((x) => x.id === id);

    if (packet.isEmotion()) {
      this.emotions[interactionId] = packet.emotions;
    } else if (packet.isText()) {
      const actorItem: HistoryItem = {
        ...this.combineTextItem(packet),
        character,
      };

      if (grpcAudioPlayer.hasPacketInQueue({ utteranceId })) {
        this.queue = [...this.queue, actorItem];
      } else {
        chatItem = actorItem;
      }
    } else if (packet.isNarratedAction()) {
      const actionItem = {
        ...this.combineNarratedActionItem(packet),
        character,
      };

      if (
        grpcAudioPlayer.isCurrentPacket({ interactionId }) ||
        !grpcAudioPlayer.hasPacketInQueue({ interactionId })
      ) {
        chatItem = actionItem;
      } else {
        this.queue = [...this.queue, actionItem];
      }
    } else if (packet.isTrigger()) {
      chatItem = this.combineTriggerItem(packet, outgoing);
    } else if (packet.isInteractionEnd()) {
      const controlItem: HistoryInteractionEnd =
        this.combineInteractionEndItem(packet);

      if (grpcAudioPlayer.hasPacketInQueue({ interactionId })) {
        this.queue = [...this.queue, controlItem];
      } else {
        chatItem = controlItem;
      }
    }

    if (chatItem) {
      const currentHistoryIndex = this.history.findIndex((item) => {
        return item.id === chatItem?.id;
      });

      if (currentHistoryIndex >= 0 && chatItem) {
        this.history[currentHistoryIndex] = chatItem;
      } else {
        this.history = [...this.history, chatItem!];
      }
    }

    return !!chatItem;
  }

  update(packet: InworldPacketT) {
    if (packet.isText()) {
      const currentHistoryIndex = this.history.findIndex(
        (item) => item.id === packet.packetId?.utteranceId,
      );

      if (currentHistoryIndex >= 0) {
        this.history[currentHistoryIndex] = {
          ...this.history[currentHistoryIndex],
          ...this.combineTextItem(packet),
        };

        return true;
      }
    }

    return false;
  }

  display(
    packet: InworldPacketT,
    type:
      | CHAT_HISTORY_TYPE.ACTOR
      | CHAT_HISTORY_TYPE.INTERACTION_END
      | CHAT_HISTORY_TYPE.NARRATED_ACTION,
  ) {
    switch (type) {
      case CHAT_HISTORY_TYPE.ACTOR:
        const foundActor = this.queue.find(
          (item) =>
            item.type === CHAT_HISTORY_TYPE.ACTOR &&
            item.id === packet.packetId.utteranceId,
        );

        if (foundActor) {
          this.history = [...this.history, foundActor];
          this.queue = [...this.queue].filter(
            (item) => item.id !== foundActor.id,
          );
        }

        return foundActor;
      case CHAT_HISTORY_TYPE.INTERACTION_END:
        // Find items in current interaction
        const inCurrentInteraction = this.queue.filter(
          (item) => item.interactionId === packet.packetId.interactionId,
        );
        const onlyInteractionEnd =
          inCurrentInteraction.length === 1 &&
          inCurrentInteraction[0].type === CHAT_HISTORY_TYPE.INTERACTION_END;

        // If only INTERACTION_END is left in list then move it to history
        if (onlyInteractionEnd) {
          this.history = [...this.history, inCurrentInteraction[0]];
          this.queue = this.queue.filter(
            (item) => item.id !== inCurrentInteraction[0].id,
          );
        }

        return onlyInteractionEnd;
      case CHAT_HISTORY_TYPE.NARRATED_ACTION:
        const byCondition = (item: HistoryItem) =>
          item.type === CHAT_HISTORY_TYPE.NARRATED_ACTION &&
          item.interactionId === packet.packetId.interactionId;

        const foundActions = this.queue.filter(byCondition);

        if (foundActions.length) {
          this.history = [...this.history, ...foundActions];
          this.queue = this.queue.filter((item) => !byCondition(item));
        }

        return !!foundActions.length;
    }
  }

  get() {
    return this.history;
  }

  filter(props: { utteranceId: string[]; interactionId: string }) {
    const { interactionId, utteranceId } = props;

    this.history = this.history.filter(
      (item: HistoryItem) => !utteranceId.includes(item.id),
    );

    this.queue = this.queue.filter(
      (item: HistoryItem) =>
        item.interactionId !== interactionId && !utteranceId.includes(item.id),
    );
  }

  clear() {
    this.queue = [];
    this.history = [];
  }

  getTranscript(user?: UserRequest): string {
    if (!this.history.length) {
      return '';
    }

    const userName = user?.name || DEFAULT_USER_NAME;

    let transcript = '';
    let characterLastSpeaking = false;

    this.history.forEach((item) => {
      const prefix = transcript.length ? '\n' : '';
      switch (item.type) {
        case CHAT_HISTORY_TYPE.ACTOR:
        case CHAT_HISTORY_TYPE.NARRATED_ACTION:
          const isCharacter = item.source.isCharacter;
          const givenName = isCharacter
            ? item.character?.displayName
            : userName;
          const emotionCode =
            this.emotions[item.interactionId]?.behavior?.code || '';
          const emotion = emotionCode ? `(${emotionCode}) ` : '';

          transcript +=
            characterLastSpeaking && isCharacter
              ? item.text
              : `${prefix}${givenName}: ${emotion}${item.text}`;
          characterLastSpeaking = isCharacter;
          break;
        case CHAT_HISTORY_TYPE.TRIGGER_EVENT:
          transcript += `${prefix}>>> ${item.name}`;
          characterLastSpeaking = false;
          break;
      }
    });

    return transcript;
  }

  private combineTextItem(packet: InworldPacketT): HistoryItemActor {
    const date = new Date(packet.date);
    const source = packet.routing?.source;
    const utteranceId = packet.packetId?.utteranceId;
    const interactionId = packet.packetId?.interactionId;

    return {
      id: utteranceId,
      isRecognizing: !packet.text.final,
      type: CHAT_HISTORY_TYPE.ACTOR,
      text: packet.text.text,
      date,
      interactionId,
      source,
    };
  }

  private combineNarratedActionItem(
    packet: InworldPacketT,
  ): HistoryItemNarratedAction {
    const date = new Date(packet.date);
    const interactionId = packet.packetId?.interactionId;

    return {
      id: v4(),
      date,
      interactionId,
      source: packet.routing?.source,
      type: CHAT_HISTORY_TYPE.NARRATED_ACTION,
      text: packet.narratedAction.text,
    };
  }

  private combineTriggerItem(
    packet: InworldPacketT,
    outgoing?: boolean,
  ): HistoryItemTriggerEvent {
    const date = new Date(packet.date);
    const source = packet.routing?.source;
    const utteranceId = packet.packetId?.utteranceId;
    const interactionId = packet.packetId?.interactionId;

    return {
      id: utteranceId,
      type: CHAT_HISTORY_TYPE.TRIGGER_EVENT,
      name: packet.trigger.name,
      date,
      interactionId,
      outgoing,
      source,
    };
  }

  private combineInteractionEndItem(
    packet: InworldPacketT,
  ): HistoryInteractionEnd {
    const date = new Date(packet.date);
    const interactionId = packet.packetId?.interactionId;

    return {
      id: v4(),
      date,
      interactionId,
      source: packet.routing?.source,
      type: CHAT_HISTORY_TYPE.INTERACTION_END,
    };
  }
}
