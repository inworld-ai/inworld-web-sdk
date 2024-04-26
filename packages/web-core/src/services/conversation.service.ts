import { v4 } from 'uuid';

import {
  DataChunkDataType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  AudioSessionState,
  CancelResponsesProps,
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
  private characters: Character[];
  private packetQueue: PacketQueueItem<InworldPacketT>[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private ttsPlaybackAction = TtsPlaybackAction.UNKNOWN;

  constructor(
    connection: ConnectionService<InworldPacketT>,
    {
      characters,
      conversationId,
    }: { characters: Character[]; conversationId?: string },
  ) {
    this.connection = connection;
    this.conversationId = conversationId ?? v4();
    this.characters = characters;
  }

  getConversationId() {
    return this.conversationId;
  }

  getCharacters() {
    return this.characters;
  }

  getHistory() {
    return this.connection.history.get(this.getConversationId());
  }

  async updateParticipants(characters: Character[]) {
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

    if (this.connection.getAudioSessionAction() === AudioSessionState.START) {
      needToReacreateAudioSession = true;
      await this.sendAudioSessionEnd();
    }

    const sent = await this.connection.send(() =>
      EventFactory.conversation(
        characters.map((character) => character.id),
        {
          conversationId: this.getConversationId(),
        },
      ),
    );

    if (needToReacreateAudioSession) {
      await this.sendAudioSessionStart();
    }

    const resolveConversation = () =>
      new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          const found = this.connection.conversations.get(
            sent.packetId.conversationId,
          );

          if (found?.state === ConversationState.ACTIVE) {
            clearInterval(interval);
            this.intervals = this.intervals.filter(
              (i: NodeJS.Timeout) => i !== interval,
            );

            this.characters = characters;
            resolve();
          }
        }, 10);
        this.intervals.push(interval);
      });

    await resolveConversation();

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

  async sendAudioSessionStart(force?: boolean) {
    if (
      !force &&
      this.connection.getAudioSessionAction() === AudioSessionState.START
    ) {
      throw Error('Audio session is already started');
    }

    return this.ensureConversation(() => {
      this.connection.setAudioSessionAction(AudioSessionState.START);
      this.connection.setCurrentAudioConversation(this);

      return this.connection
        .getEventFactory()
        .audioSessionStart({ conversationId: this.getConversationId() });
    });
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
    return this.ensureConversation(() =>
      this.connection.getEventFactory().cancelResponse({
        ...cancelResponses,
        conversationId: this.getConversationId(),
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
    if (this.characters.length > 1) {
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

  async ensureConversation(
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
      const resolvePacket = () =>
        new Promise<InworldPacketT>((resolve) => {
          const done = (packet: InworldPacketT) => {
            resolve(packet);
          };

          const interval = setInterval(() => {
            if (packet) {
              clearInterval(interval);

              this.intervals = this.intervals.filter(
                (i: NodeJS.Timeout) => i !== interval,
              );

              done(packet);
            }
          }, 10);
          this.intervals.push(interval);
        });

      this.packetQueue.push({
        getPacket,
        afterWriting: (inworldPacket: InworldPacketT) => {
          packet = inworldPacket;
        },
      });

      return resolvePacket();
    }

    this.connection.conversations.set(this.getConversationId(), {
      service: conversation.service,
      state: ConversationState.PROCESSING,
    });

    const conversationPacket = await this.connection.send(() =>
      EventFactory.conversation(conversation.service.getParticipants(), {
        conversationId: this.getConversationId(),
      }),
    );

    const resolveConversation = () =>
      new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          const found = this.connection.conversations.get(
            conversationPacket.packetId.conversationId,
          );

          if (found?.state === ConversationState.ACTIVE) {
            clearInterval(interval);
            this.intervals = this.intervals.filter(
              (i: NodeJS.Timeout) => i !== interval,
            );

            resolve();
          }
        }, 10);
        this.intervals.push(interval);
      });

    await resolveConversation();

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

    this.packetQueue.forEach(async (item: PacketQueueItem<InworldPacketT>) => {
      const inworldPacket = await this.connection.send(item.getPacket);
      item.afterWriting(inworldPacket);
    });

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

  private getParticipants() {
    return this.characters.map((character) => character.id);
  }
}
