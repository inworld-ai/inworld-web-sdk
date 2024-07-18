import { InworldPacket as ProtoPacket } from '../../proto/ai/inworld/packets/packets.pb';
import {
  AudioSessionStartPacketParams,
  AudioSessionState,
  CancelResponsesProps,
  ChangeSceneProps,
  ConversationParticipant,
  ConversationState,
  TriggerParameter,
} from '../common/data_structures';
import {
  CHARACTER_HAS_INVALID_FORMAT,
  CURRENT_CHARACTER_NOT_SET,
  SCENE_HAS_INVALID_FORMAT,
} from '../common/errors';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import { InworldPlayer } from '../components/sound/inworld_player';
import { InworldRecorder } from '../components/sound/inworld_recorder';
import { Character } from '../entities/character.entity';
import { InworldError } from '../entities/error.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { EventFactory } from '../factories/event';
import { characterHasValidFormat, sceneHasValidFormat } from '../guard/scene';
import { ConnectionService } from './connection.service';
import { ConversationService } from './conversation.service';
import { FeedbackService } from './feedback.service';

interface InworldConnectionServiceProps<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  connection: ConnectionService<InworldPacketT>;
  grpcAudioPlayer: GrpcAudioPlayback<InworldPacketT>;
  grpcAudioRecorder: GrpcAudioRecorder;
  webRtcLoopbackBiDiSession: GrpcWebRtcLoopbackBiDiSession;
}

export class InworldConnectionService<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  readonly feedback: FeedbackService<InworldPacketT>;
  private connection: ConnectionService<InworldPacketT>;
  private grpcAudioPlayer: GrpcAudioPlayback<InworldPacketT>;
  private oneToOneConversation: ConversationService<InworldPacketT>;

  player: InworldPlayer<InworldPacketT>;
  recorder: InworldRecorder;

  constructor(props: InworldConnectionServiceProps<InworldPacketT>) {
    this.connection = props.connection;
    this.grpcAudioPlayer = props.grpcAudioPlayer;
    this.feedback = new FeedbackService(props.connection);

    this.player = new InworldPlayer<InworldPacketT>({
      grpcAudioPlayer: this.grpcAudioPlayer,
    });
    this.recorder = new InworldRecorder({
      listener: async (base64AudioChunk: string) => {
        const conversation = this.connection.getCurrentAudioConversation();

        if (!conversation) {
          this.connection.onError(
            new InworldError('No conversation is available to send audio.'),
          );
          return;
        }

        if (
          !this.connection.isActive() &&
          this.connection.getAudioSessionAction() !== AudioSessionState.START
        ) {
          await conversation.sendAudioSessionStart();
        }

        conversation.sendAudio(base64AudioChunk);
      },
      grpcAudioPlayer: this.grpcAudioPlayer,
      grpcAudioRecorder: props.grpcAudioRecorder,
      webRtcLoopbackBiDiSession: props.webRtcLoopbackBiDiSession,
    });
  }

  async getSessionState() {
    return this.connection.getSessionState();
  }

  async open() {
    return this.connection.openManually();
  }

  async close() {
    this.player.clear();
    this.recorder.stop();
    await this.player.stop();
    await this.connection.close();
  }

  isActive() {
    return this.connection.isActive();
  }

  async getCharacters() {
    return this.connection.getCharacters();
  }

  async getCurrentCharacter() {
    return this.connection.getCurrentCharacter();
  }

  getCharacterById(id: string) {
    return this.connection.getCharactersByIds([id])?.[0];
  }

  getCharacterByResourceName(name: string) {
    return this.connection.getCharactersByResourceNames([name])?.[0];
  }

  async setCurrentCharacter(character: Character) {
    this.connection.setCurrentCharacter(character);

    if (!this.oneToOneConversation) {
      this.oneToOneConversation = new ConversationService<InworldPacketT>(
        this.connection,
        {
          participants: [character.resourceName, ConversationParticipant.USER],
          conversationId: this.oneToOneConversation?.getConversationId(),
          addCharacters: this.addCharacters.bind(this),
        },
      );

      this.addConversationToConnection(this.oneToOneConversation);
    } else {
      this.oneToOneConversation.changeParticipants([character.resourceName]);
    }

    if (
      this.connection.conversations.get(
        this.oneToOneConversation.getConversationId(),
      ).state === ConversationState.ACTIVE
    ) {
      await this.oneToOneConversation.updateParticipants([
        character.resourceName,
      ]);
    }
  }

  getHistory() {
    return this.oneToOneConversation?.getHistory() ?? [];
  }

  getFullHistory() {
    return this.connection.getHistory();
  }

  clearHistory() {
    const diff = this.getHistory();

    this.connection.clearHistory();

    if (diff.length > 0) {
      this.connection.onHistoryChange([], { diff });
    }
  }

  getTranscript() {
    return this.oneToOneConversation?.getTranscript() ?? '';
  }

  getFullTranscript() {
    return this.connection.getTranscript();
  }

  async getCurrentConversation() {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation;
  }

  getConversations() {
    return [...this.connection.conversations.entries()].map(
      ([conversationId, conversation]) => ({
        conversationId,
        characters: conversation.service.getCharacters(),
      }),
    );
  }

  async sendText(text: string) {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendText(text);
  }

  async sendAudio(chunk: string) {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendAudio(chunk);
  }

  async sendTrigger(
    name: string,
    parameters?: TriggerParameter[] | { parameters: TriggerParameter[] },
  ) {
    await this.ensureOneToOneConversation();

    const character = await this.getCurrentCharacter();

    if (parameters && Array.isArray(parameters)) {
      // TODO: Remove this deprecation warning in the next major release.
      console.warn(
        'Passing parameters as an array is deprecated. Please use an object instead.',
      );

      return this.oneToOneConversation.sendTrigger(name, {
        parameters,
        character,
      });
    } else if (!parameters || !Array.isArray(parameters)) {
      return this.oneToOneConversation.sendTrigger(name, {
        parameters:
          parameters && !Array.isArray(parameters)
            ? parameters.parameters
            : undefined,
        character,
      });
    }
  }

  async sendAudioSessionStart(params?: AudioSessionStartPacketParams) {
    if (this.connection.getAudioSessionAction() === AudioSessionState.START) {
      throw Error('Audio session is already started');
    }

    this.connection.setAudioSessionAction(AudioSessionState.START);

    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendAudioSessionStart(params, true);
  }

  async sendAudioSessionEnd() {
    if (this.connection.getAudioSessionAction() !== AudioSessionState.START) {
      throw Error(
        'Audio session cannot be ended because it has not been started',
      );
    }

    this.connection.setAudioSessionAction(AudioSessionState.END);

    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendAudioSessionEnd(true);
  }

  async sendTTSPlaybackMute(isMuted: boolean) {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendTTSPlaybackMute(isMuted);
  }

  async sendCancelResponse(cancelResponses?: CancelResponsesProps) {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendCancelResponse(cancelResponses);
  }

  async sendNarratedAction(text: string) {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendNarratedAction(text);
  }

  async reloadScene() {
    // TODO: Remove this deprecation warning in the next major release.
    console.warn('Reload scene is deprecated. Please use changeScene instead.');

    await this.changeScene(this.connection.getSceneName());
  }

  async changeScene(name: string, props?: ChangeSceneProps) {
    if (!sceneHasValidFormat(name) && !characterHasValidFormat(name)) {
      throw Error(SCENE_HAS_INVALID_FORMAT);
    }

    // Clear all conversations
    this.oneToOneConversation = undefined;
    this.connection.conversations.clear();

    return this.connection.change(name, props);
  }

  async addCharacters(names: string[]) {
    const invalid = names.find((name) => !characterHasValidFormat(name));

    if (invalid) {
      throw Error(CHARACTER_HAS_INVALID_FORMAT);
    }

    const result = await this.connection.send(() =>
      EventFactory.loadCharacters(names),
    );

    await this.resolveInterval(() => {
      const found = this.connection.getCharactersByResourceNames(names);

      return found.length && found.length === names.length;
    });

    return result;
  }

  async removeCharacters(names: string[]) {
    const invalid = names.find((name) => !characterHasValidFormat(name));

    if (invalid) {
      throw Error(CHARACTER_HAS_INVALID_FORMAT);
    }

    const ids = (await this.getCharacters())
      .filter((c) => names.includes(c.resourceName))
      .map((c) => c.id);

    const result = await this.connection.send(() =>
      EventFactory.unloadCharacters(ids),
    );

    this.connection.removeCharacters(names);

    this.connection.conversations.forEach((conversation) => {
      conversation.service.changeParticipants(
        conversation.service
          .getCharacters()
          .filter((c) => !names.includes(c.resourceName))
          .map((c) => c.resourceName),
      );
    });

    return result;
  }

  async sendCustomPacket(getPacket: () => ProtoPacket) {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendCustomPacket(getPacket);
  }

  async interrupt() {
    return this.connection.interrupt();
  }

  startConversation(participants: string[]) {
    const service = new ConversationService(this.connection, {
      participants,
      addCharacters: this.addCharacters.bind(this),
    });

    this.connection.conversations.set(service.getConversationId(), {
      service,
      state: ConversationState.INACTIVE,
    });

    return service;
  }

  baseProtoPacket(props?: {
    utteranceId?: boolean;
    interactionId?: boolean;
    conversationId?: string;
    characters?: Character[];
  }) {
    return this.connection.getEventFactory().baseProtoPacket(props);
  }

  private async ensureOneToOneConversation() {
    if (!this.oneToOneConversation) {
      const character = await this.getCurrentCharacter();

      if (!character) {
        throw Error(CURRENT_CHARACTER_NOT_SET);
      }

      this.oneToOneConversation = new ConversationService<InworldPacketT>(
        this.connection,
        {
          participants: [character.resourceName, ConversationParticipant.USER],
          addCharacters: this.addCharacters.bind(this),
        },
      );

      this.addConversationToConnection(this.oneToOneConversation);
    }
  }

  private async resolveInterval(done: () => boolean) {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (done()) {
          clearInterval(interval);
          this.connection.removeInterval(interval);
          resolve();
        }
      }, 10);

      this.connection.addInterval(interval);
    });
  }

  private addConversationToConnection(
    conversation: ConversationService<InworldPacketT>,
  ) {
    if (!this.connection.conversations.has(conversation.getConversationId())) {
      this.connection.conversations.set(conversation.getConversationId(), {
        service: conversation,
        state: ConversationState.INACTIVE,
      });
    }
  }
}
