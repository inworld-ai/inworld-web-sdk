import { v4 } from 'uuid';

import { DEFAULT_USER_NAME } from '../common/constants';
import { Extension, TriggerParameter, User } from '../common/data_structures';
import { Character } from '../entities/character.entity';
import { EmotionEvent } from '../entities/packets/emotion/emotion.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { Actor } from '../entities/packets/routing.entity';
import { GrpcAudioPlayback } from './sound/grpc_audio.playback';

interface InworldHistoryAddProps<InworldPacketT> {
  characters: Character[];
  grpcAudioPlayer: GrpcAudioPlayback;
  packet: InworldPacketT;
  outgoing?: boolean;
  fromHistory?: boolean;
}

export enum CHAT_HISTORY_TYPE {
  ACTOR = 'actor',
  NARRATED_ACTION = 'narrated_action',
  TRIGGER_EVENT = 'trigger_event',
  INTERACTION_END = 'interaction_end',
  SCENE_CHANGE = 'scene_change',
}

export interface HistoryItemBase {
  date: Date;
  id: string;
  scene: string;
  interactionId?: string;
  source: Actor;
  type: CHAT_HISTORY_TYPE;
  fromHistory?: boolean;
}

export interface HistoryItemActor extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.ACTOR;
  text?: string;
  emotions?: EmotionEvent;
  isRecognizing?: boolean;
  // TODO: Remove this field in the next major release.
  character?: Character;
  characters?: Character[];
  correlationId?: string;
}

export interface HistoryItemTriggerEvent extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.TRIGGER_EVENT;
  name: string;
  parameters: TriggerParameter[];
  outgoing?: boolean;
  correlationId?: string;
}

export interface HistoryInteractionEnd extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.INTERACTION_END;
}

export interface HistoryItemNarratedAction extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.NARRATED_ACTION;
  text?: string;
  // TODO: Remove this field in the next major release.
  character?: Character;
  characters?: Character[];
}

export interface HistoryItemSceneChange {
  date: Date;
  id: string;
  interactionId?: string;
  source: Actor;
  type: CHAT_HISTORY_TYPE.SCENE_CHANGE;
  to?: string;
  loadedCharacters?: Character[];
  addedCharacters?: Character[];
}

export type HistoryItem =
  | HistoryItemActor
  | HistoryItemTriggerEvent
  | HistoryInteractionEnd
  | HistoryItemNarratedAction
  | HistoryItemSceneChange;

interface EmotionsMap {
  [key: string]: EmotionEvent;
}

interface InworldHistoryProps<InworldPacketT, HistoryItemT> {
  audioEnabled: boolean;
  extension?: Extension<InworldPacketT, HistoryItemT>;
  user?: User;
  scene: string;
}

interface ConversationItem {
  packet: InworldPacket;
  isApplied: boolean;
}

export class InworldHistory<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> {
  private audioEnabled: boolean;
  private scene: string;
  private user?: User;
  private history: HistoryItem[] = [];
  private queue: HistoryItem[] = [];
  private emotions: EmotionsMap = {};
  private extension: Extension<InworldPacketT, HistoryItemT> | undefined;
  private conversationItems: ConversationItem[] = [];

  constructor(props: InworldHistoryProps<InworldPacketT, HistoryItemT>) {
    if (props.extension) {
      this.extension = props.extension;
    }

    if (props.user) {
      this.user = props.user;
    }

    this.scene = props?.scene;
    this.audioEnabled = props.audioEnabled;
  }

  setAudioEnabled(enabled: boolean) {
    this.audioEnabled = enabled;
  }

  addOrUpdate({
    characters,
    grpcAudioPlayer,
    packet,
    outgoing,
    fromHistory = false,
  }: InworldHistoryAddProps<InworldPacketT>) {
    let historyItem: HistoryItem | undefined;
    let queueItem: HistoryItem | undefined;

    const utteranceId = packet.packetId.utteranceId;
    const interactionId = packet.packetId.interactionId;

    const byId = characters.reduce(
      (acc, character) => {
        acc[character.id] = character;
        return acc;
      },
      {} as { [key: string]: Character },
    );
    const itemCharacters = [];

    if (packet.routing.source.isCharacter) {
      itemCharacters.push(byId[packet.routing.source.name]);
    } else {
      itemCharacters.push(
        ...packet.routing.targets
          .filter((x) => x.isCharacter && byId[x.name])
          .map((x) => byId[x.name]),
      );
    }

    switch (true) {
      case packet.isAudio():
        this.conversationItems.push({ packet, isApplied: false });
        break;

      case packet.isEmotion():
        this.emotions[interactionId] = packet.emotions;
        break;

      case packet.isText():
      case packet.isNarratedAction():
        const textItem: HistoryItem = packet.isText()
          ? {
              ...this.combineTextItem(packet),
              character: itemCharacters[0],
              characters: itemCharacters,
              fromHistory,
            }
          : {
              ...this.combineNarratedActionItem(
                packet,
                itemCharacters,
                this.user,
              ),
              fromHistory,
            };

        const audioIsApplied = !!this.conversationItems.find(
          (item: ConversationItem) =>
            !!item.packet.isAudio() &&
            item.isApplied &&
            item.packet.packetId.utteranceId === utteranceId,
        );

        if (
          audioIsApplied ||
          fromHistory ||
          packet.routing.source.isPlayer ||
          !this.audioEnabled
        ) {
          historyItem = textItem;
        } else {
          queueItem = textItem;
        }
        break;

      case packet.isTrigger():
        historyItem = {
          ...this.combineTriggerItem(packet, outgoing),
          fromHistory,
        };
        break;

      case packet.isInteractionEnd():
        const controlItem: HistoryInteractionEnd =
          this.combineInteractionEndItem(packet);

        if (
          this.audioEnabled &&
          grpcAudioPlayer.hasPacketInQueue({ interactionId })
        ) {
          queueItem = controlItem;
        } else {
          historyItem = controlItem;
        }
        break;

      case packet.isSceneMutationResponse():
      case packet.isSceneMutationRequest():
        if (packet.sceneMutation?.name || packet.isSceneMutationResponse()) {
          historyItem = this.combineSceneChangeItem(packet);

          if (historyItem.to) {
            this.scene = historyItem.to;
          }
        }

        break;
    }

    if (historyItem) {
      const currentHistoryIndex = this.history.findIndex((item) => {
        return item.id === historyItem.id;
      });

      const item = this.convertToExtendedType(packet, historyItem);

      if (currentHistoryIndex >= 0) {
        this.history[currentHistoryIndex] = {
          ...this.history[currentHistoryIndex],
          ...item,
        };
      } else {
        this.history = [...this.history, item!];
      }
    }

    if (queueItem) {
      this.queue = [
        ...this.queue,
        this.convertToExtendedType(packet, queueItem),
      ];
    }

    return [historyItem];
  }

  update(packet: InworldPacketT) {
    if (packet.isText()) {
      let text: HistoryItemActor;
      const currentHistoryIndex = this.history.findIndex(
        (item) => item.id === packet.packetId.utteranceId,
      );

      if (currentHistoryIndex >= 0) {
        text = this.combineTextItem(packet);
        this.history[currentHistoryIndex] = {
          ...this.history[currentHistoryIndex],
          ...text,
        };

        return [text];
      }
    } else if (packet.isAudio()) {
      this.markAsApplied(
        (item) =>
          item.isAudio() &&
          item.packetId.utteranceId === packet.packetId.utteranceId,
      );

      const actors = this.display(packet, CHAT_HISTORY_TYPE.ACTOR);
      const actions = this.display(packet, CHAT_HISTORY_TYPE.NARRATED_ACTION);
      const ends = this.display(packet, CHAT_HISTORY_TYPE.INTERACTION_END);

      if (ends.length) {
        this.conversationItems = this.conversationItems.filter(
          (item: ConversationItem) =>
            item.packet.packetId.interactionId !==
            packet.packetId.interactionId,
        );
      }

      return [...actors, ...actions, ...ends];
    }

    return [];
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

        return foundActor ? [foundActor] : [];
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

          return [inCurrentInteraction[0]];
        }

        return [];
      case CHAT_HISTORY_TYPE.NARRATED_ACTION:
        const byCondition = (item: HistoryItem) =>
          item.type === CHAT_HISTORY_TYPE.NARRATED_ACTION &&
          item.interactionId === packet.packetId.interactionId;

        const foundActions = this.queue.filter(byCondition);

        if (foundActions.length) {
          this.history = [...this.history, ...foundActions];
          this.queue = this.queue.filter((item) => !byCondition(item));
        }

        return foundActions;
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

  getTranscript(): string {
    if (!this.history.length) {
      return '';
    }

    let transcript = '';
    let characterLastSpeaking = false;

    this.history.forEach((item) => {
      const prefix = transcript.length ? '\n' : '';
      switch (item.type) {
        case CHAT_HISTORY_TYPE.ACTOR:
        case CHAT_HISTORY_TYPE.NARRATED_ACTION:
          const isCharacter = item.source.isCharacter;
          const givenName = isCharacter
            ? item.character.displayName
            : this.getUserName(this.user);
          const emotionCode =
            (isCharacter &&
              this.emotions[item.interactionId]?.behavior?.code) ||
            '';
          const emotion = emotionCode ? `(${emotionCode}) ` : '';

          const text =
            item.type === CHAT_HISTORY_TYPE.NARRATED_ACTION
              ? `*${item.text}*`
              : item.text;
          transcript +=
            characterLastSpeaking && isCharacter
              ? `${
                  transcript?.[transcript.length - 1] === ' ' ? '' : ' '
                }${text}`
              : `${prefix}${givenName}: ${emotion}${text}`;
          characterLastSpeaking = isCharacter;
          break;
        case CHAT_HISTORY_TYPE.TRIGGER_EVENT:
          transcript += `${prefix}>>> ${item.name}`;
          characterLastSpeaking = false;
          break;
        case CHAT_HISTORY_TYPE.SCENE_CHANGE:
          transcript += `${prefix}${prefix}>>> Now moving to ${item.to}`;
          characterLastSpeaking = false;
          break;
      }
    });

    return transcript;
  }

  private getUserName(user?: User) {
    return user?.fullName || DEFAULT_USER_NAME;
  }

  private combineTextItem(packet: InworldPacketT): HistoryItemActor {
    const date = new Date(packet.date);
    const source = packet.routing.source;
    const utteranceId = packet.packetId.utteranceId;
    const interactionId = packet.packetId.interactionId;
    const correlationId = packet.packetId.correlationId;

    return {
      id: utteranceId,
      isRecognizing: !packet.text.final,
      scene: this.scene,
      type: CHAT_HISTORY_TYPE.ACTOR,
      text: packet.text.text,
      correlationId,
      date,
      interactionId,
      source,
    };
  }

  private combineSceneChangeItem(
    packet: InworldPacketT,
  ): HistoryItemSceneChange {
    return {
      id: packet.packetId.interactionId,
      date: new Date(packet.date),
      interactionId: packet.packetId.interactionId,
      type: CHAT_HISTORY_TYPE.SCENE_CHANGE,
      source: packet.routing.source,
      ...(packet.sceneMutation?.name && {
        to: packet.sceneMutation.name,
      }),
      ...(packet.sceneMutation?.loadedCharacters && {
        loadedCharacters: packet.sceneMutation.loadedCharacters,
      }),
      ...(packet.sceneMutation?.addedCharacters && {
        addedCharacters: packet.sceneMutation.addedCharacters,
      }),
    };
  }

  private combineNarratedActionItem(
    packet: InworldPacketT,
    characters: Character[],
    user?: User,
  ): HistoryItemNarratedAction {
    const date = new Date(packet.date);
    const interactionId = packet.packetId.interactionId;
    const text = packet.routing.source.isPlayer
      ? packet.narratedAction.text
          .replaceAll('{character}', characters[0].displayName)
          .replaceAll('{player}', this.getUserName(user))
      : packet.narratedAction.text;

    return {
      id: v4(),
      date,
      scene: this.scene,
      character: characters[0],
      characters,
      interactionId,
      source: packet.routing.source,
      type: CHAT_HISTORY_TYPE.NARRATED_ACTION,
      text,
    };
  }

  private combineTriggerItem(
    packet: InworldPacketT,
    outgoing?: boolean,
  ): HistoryItemTriggerEvent {
    const date = new Date(packet.date);
    const source = packet.routing.source;
    const utteranceId = packet.packetId.utteranceId;
    const interactionId = packet.packetId.interactionId;
    const correlationId = packet.packetId.correlationId;

    return {
      id: utteranceId,
      type: CHAT_HISTORY_TYPE.TRIGGER_EVENT,
      name: packet.trigger.name,
      scene: this.scene,
      correlationId,
      parameters: packet.trigger.parameters,
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
    const interactionId = packet.packetId.interactionId;

    return {
      id: v4(),
      date,
      interactionId,
      scene: this.scene,
      source: packet.routing.source,
      type: CHAT_HISTORY_TYPE.INTERACTION_END,
    };
  }

  private convertToExtendedType(packet: InworldPacketT, item: HistoryItem) {
    return this.extension?.historyItem?.(packet, item) || item;
  }

  private markAsApplied = (compare: (item: InworldPacket) => Boolean) => {
    const found = this.conversationItems.find(
      (item: ConversationItem) => !item.isApplied && compare(item.packet),
    );

    if (found) {
      found.isApplied = true;
    }

    return found;
  };
}
