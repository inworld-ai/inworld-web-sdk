import { v4 } from 'uuid';

import {
  DataChunkDataType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  AudioSessionStartPacketParams,
  AudioSessionState,
  CancelResponsesProps,
  ConversationParticipant,
  ConversationState,
  SendPacketParams,
  TriggerParameter,
  TtsPlaybackAction,
} from '../common/data_structures';
import { MULTI_CHAR_NARRATED_ACTIONS } from '../common/errors';
import { Character } from '../entities/character.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { EventFactory } from '../factories/event';
import { ConnectionService } from './connection.service';

export interface PacketQueueItem<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  getPacket: () => ProtoPacket;
  afterWriting: (packet: InworldPacketT) => void;
}

export class ConversationService<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private connection: ConnectionService<InworldPacketT>;
  private conversationId: string;
  private participants: string[];
  private addCharacters?: (names: string[]) => Promise<void>;
  private packetQueue: PacketQueueItem<InworldPacketT>[] = [];
  private ttsPlaybackAction = TtsPlaybackAction.UNKNOWN;

  constructor(
    connection: ConnectionService<InworldPacketT>,
    {
      participants,
      conversationId,
      addCharacters,
    }: {
      participants: string[];
      conversationId?: string;
      addCharacters: (names: string[]) => Promise<void>;
    },
  ) {
    this.connection = connection;
    this.conversationId = conversationId ?? v4();
    this.participants = participants;

    this.addCharacters = addCharacters;
  }

  getConversationId() {
    return this.conversationId;
  }

  getParticipants() {
    return this.participants;
  }

  getCharacters() {
    return this.connection.getCharactersByResourceNames(
      this.getCharacterParticipants(),
    );
  }

  getHistory() {
    return this.connection.history.get(this.getConversationId());
  }

  getTranscript() {
    return this.connection.history.getTranscript(this.getConversationId());
  }

  changeParticipants(participants: string[]) {
    this.participants = participants;
  }

  async updateParticipants(participants: string[]) {
    const conversationId = this.getConversationId();
    const conversation = this.connection.conversations.get(conversationId);

    if (!conversation) {
      throw Error(`Conversation ${conversationId} not found`);
    }

    if (
      ![ConversationState.ACTIVE, ConversationState.INACTIVE].includes(
        conversation.state,
      )
    ) {
      return;
    }

    this.connection.conversations.set(conversationId, {
      service: conversation.service,
      state: ConversationState.PROCESSING,
    });

    let needToReacreateAudioSession = false;

    // If audio session is started, we need to end it before updating participants
    if (this.connection.getAudioSessionAction() === AudioSessionState.START) {
      needToReacreateAudioSession = true;
      await this.sendAudioSessionEnd();
    }

    // Load characters if they are not loaded
    const charactersNamesOnly = this.getCharacterParticipants(participants);
    let characters = await this.connection.getCharacters();
    const charactersToAdd = charactersNamesOnly.filter(
      (p) => !characters.find((c) => c.resourceName === p),
    );

    if (charactersToAdd.length) {
      await this.addCharacters(charactersToAdd);
    }
    characters = (await this.connection.getCharacters()).filter((c) =>
      charactersNamesOnly.includes(c.resourceName),
    );

    // Update conversation
    const conversationParticipants = characters.map((c) => c.id);
    if (participants.includes(ConversationParticipant.USER)) {
      conversationParticipants.push(ConversationParticipant.USER);
    }

    const sent = await this.connection.send(() =>
      EventFactory.conversation(conversationParticipants, {
        conversationId: this.getConversationId(),
      }),
    );

    // If audio session was started before, we need to restart it
    if (needToReacreateAudioSession) {
      await this.sendAudioSessionStart();
    }

    await this.resolveInterval(
      () => {
        const found = this.connection.conversations.get(
          sent.packetId.conversationId,
        );

        return found?.state === ConversationState.ACTIVE;
      },
      () => {
        this.participants = participants;
        this.releaseQueue();
      },
    );

    return conversation.service;
  }

  async sendText(text: string) {
    return this.ensureConversation(() =>
      this.connection
        .getEventFactory()
        .text(text, { conversationId: this.getConversationId() }),
    );
  }

  async sendAudio(chunk: string) {
    return this.ensureConversation(() =>
      this.connection
        .getEventFactory()
        .dataChunk(chunk, DataChunkDataType.AUDIO, {
          conversationId: this.getConversationId(),
        }),
    );
  }

  async sendTrigger(
    name: string,
    parameters?: { parameters?: TriggerParameter[]; character?: Character },
  ) {
    return this.ensureConversation(() =>
      this.connection.getEventFactory().trigger(name, {
        ...parameters,
        conversationId: this.getConversationId(),
      }),
    );
  }

  async sendAudioSessionStart(
    params?: AudioSessionStartPacketParams,
    force?: boolean,
  ) {
    if (
      !force &&
      this.connection.getAudioSessionAction() === AudioSessionState.START
    ) {
      throw Error('Audio session is already started');
    }

    this.connection.setAudioSessionAction(AudioSessionState.START);
    this.connection.setCurrentAudioConversation(this);

    return this.ensureConversation(() =>
      this.connection.getEventFactory().audioSessionStart({
        conversationId: this.getConversationId(),
        mode: params?.mode,
      }),
    );
  }

  async sendAudioSessionEnd(force?: boolean) {
    if (
      !force &&
      this.connection.getAudioSessionAction() !== AudioSessionState.START
    ) {
      throw Error(
        'Audio session cannot be ended because it has not been started',
      );
    }

    return this.ensureConversation(() => {
      this.connection.setAudioSessionAction(AudioSessionState.END);
      this.connection.setCurrentAudioConversation(undefined);

      return this.connection
        .getEventFactory()
        .audioSessionEnd({ conversationId: this.getConversationId() });
    });
  }

  async sendCancelResponse(cancelResponses?: CancelResponsesProps) {
    const characters = this.getCharacters();

    if (characters.length != 1) {
      return;
    }

    return this.ensureConversation(() =>
      this.connection.getEventFactory().cancelResponse({
        ...cancelResponses,
        character: characters[0],
      }),
    );
  }

  async sendTTSPlaybackMute(isMuted: boolean) {
    return this.ensureConversation(
      () => {
        this.setTtsPlaybackAction(
          isMuted ? TtsPlaybackAction.MUTE : TtsPlaybackAction.UNMUTE,
        );

        return this.connection.getEventFactory().mutePlayback(isMuted, {
          conversationId: this.getConversationId(),
        });
      },
      { skipMuting: false },
    );
  }

  async sendNarratedAction(text: string) {
    if (this.getCharacterParticipants().length > 1) {
      throw Error(MULTI_CHAR_NARRATED_ACTIONS);
    }

    return this.ensureConversation(() =>
      this.connection.getEventFactory().narratedAction(text, {
        conversationId: this.getConversationId(),
      }),
    );
  }

  async sendCustomPacket(getPacket: (params: SendPacketParams) => ProtoPacket) {
    return this.ensureConversation(() =>
      getPacket({
        conversationId: this.getConversationId(),
      }),
    );
  }

  private async ensureConversation(
    getPacket: () => ProtoPacket,
    props?: { skipMuting: boolean },
  ) {
    const conversationId = this.getConversationId();
    const conversation = this.connection.conversations.get(conversationId);

    if (!conversation) {
      throw Error(`Conversation ${conversationId} not found`);
    }

    if (conversation.state === ConversationState.ACTIVE) {
      return this.connection.send(getPacket);
    } else if (conversation.state === ConversationState.PROCESSING) {
      let packet: InworldPacketT;

      this.packetQueue.push({
        getPacket,
        afterWriting: (inworldPacket: InworldPacketT) => {
          packet = inworldPacket;
        },
      });

      return this.resolveInterval<InworldPacketT>(
        () => !!packet,
        () => packet,
      );
    }

    this.connection.conversations.set(this.getConversationId(), {
      service: conversation.service,
      state: ConversationState.PROCESSING,
    });

    const conversationParticipants = conversation.service
      .getCharacters()
      .map((c) => c.id);
    if (
      conversation.service
        .getParticipants()
        .includes(ConversationParticipant.USER)
    ) {
      conversationParticipants.push(ConversationParticipant.USER);
    }
    const conversationPacket = await this.connection.send(() =>
      EventFactory.conversation(conversationParticipants, {
        conversationId: this.getConversationId(),
      }),
    );

    await this.resolveInterval(() => {
      const found = this.connection.conversations.get(
        conversationPacket.packetId.conversationId,
      );

      return found?.state === ConversationState.ACTIVE;
    });

    if (
      this.connection.isAutoReconnected() &&
      this.getTtsPlaybackAction() === TtsPlaybackAction.MUTE &&
      !props?.skipMuting
    ) {
      await this.connection.send(() =>
        this.connection.getEventFactory().mutePlayback(true, {
          conversationId: this.getConversationId(),
        }),
      );
    }

    const sent = await this.connection.send(getPacket);

    this.releaseQueue();

    return sent;
  }

  setTtsPlaybackAction(action: TtsPlaybackAction) {
    this.ttsPlaybackAction = action;
    this.connection.history.setAudioEnabled(
      this.getConversationId(),
      action === TtsPlaybackAction.UNMUTE,
    );
  }

  getTtsPlaybackAction() {
    return this.ttsPlaybackAction;
  }

  private async resolveInterval<T = void>(
    done: () => boolean,
    resolve?: () => T,
  ) {
    return new Promise<T>((r) => {
      const interval = setInterval(() => {
        if (done()) {
          clearInterval(interval);
          this.connection.removeInterval(interval);
          r(resolve?.() as T);
        }
      }, 10);

      this.connection.addInterval(interval);
    });
  }

  private releaseQueue() {
    this.packetQueue.forEach(async (item: PacketQueueItem<InworldPacketT>) => {
      const inworldPacket = await this.connection.send(item.getPacket);
      item.afterWriting(inworldPacket);
    });
    this.packetQueue = [];
  }

  private getCharacterParticipants(participants = this.participants) {
    return participants.filter((p) => p !== ConversationParticipant.USER);
  }
}
