import { InworldPacket as ProtoPacket } from '../../proto/ai/inworld/packets/packets.pb';
import {
  AudioSessionState,
  CancelResponsesProps,
  ConversationState,
  TriggerParameter,
} from '../common/data_structures';
import {
  CHARACTER_HAS_INVALID_FORMAT,
  CURRENT_CHARACTER_NOT_SET,
  SCENE_HAS_INVALID_FORMAT,
  SCENE_NAME_THE_SAME,
} from '../common/errors';
import { GrpcAudioPlayback } from '../components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../components/sound/grpc_web_rtc_loopback_bidi.session';
import { InworldPlayer } from '../components/sound/inworld_player';
import { InworldRecorder } from '../components/sound/inworld_recorder';
import { Character } from '../entities/character.entity';
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
            Error('No conversation is available to send audio.'),
          );
          return;
        }

        if (
          !this.connection.isActive() &&
          this.connection.isAutoReconnected() &&
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
    this.connection.close();
    this.recorder.stop();
    await this.player.stop();
    this.player.clear();
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

  setCurrentCharacter(character: Character) {
    this.connection.setCurrentCharacter(character);

    this.oneToOneConversation = new ConversationService<InworldPacketT>(
      this.connection,
      {
        characters: [character],
        conversationId: this.oneToOneConversation?.getConversationId(),
      },
    );

    this.addConversationToConnection(this.oneToOneConversation);
  }

  getHistory() {
    return this.oneToOneConversation?.getHistory() ?? [];
  }

  getFullHistory() {
    return this.connection.getHistory();
  }

  clearHistory() {
    return this.connection.clearHistory();
  }

  getTranscript() {
    return this.oneToOneConversation?.getTranscript() ?? '';
  }

  getFullTranscript() {
    return this.connection.getTranscript();
  }

  getCurrentConversation() {
    if (!this.oneToOneConversation) {
      return;
    }

    return {
      conversationId: this.oneToOneConversation.getConversationId(),
      characters: this.oneToOneConversation.getCharacters(),
    };
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

  async sendAudioSessionStart() {
    if (this.connection.getAudioSessionAction() === AudioSessionState.START) {
      throw Error('Audio session is already started');
    }

    this.connection.setAudioSessionAction(AudioSessionState.START);

    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendAudioSessionStart(true);
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

  async sendTTSPlaybackStart() {
    console.warn('`sendTTSPlaybackStart` method is deprecated.');

    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.ensureConversation(() =>
      this.connection.getEventFactory().ttsPlaybackStart({
        conversationId: this.oneToOneConversation.getConversationId(),
      }),
    );
  }

  async sendTTSPlaybackEnd() {
    console.warn('`sendTTSPlaybackEnd` method is deprecated.');

    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.ensureConversation(() =>
      this.connection.getEventFactory().ttsPlaybackEnd({
        conversationId: this.oneToOneConversation.getConversationId(),
      }),
    );
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
    return this.connection.send(() =>
      EventFactory.loadScene(this.connection.getSceneName()),
    );
  }

  async changeScene(name: string) {
    if (!sceneHasValidFormat(name)) {
      throw Error(SCENE_HAS_INVALID_FORMAT);
    }

    if (this.connection.getSceneName() === name) {
      throw Error(SCENE_NAME_THE_SAME);
    }

    this.connection.setNextSceneName(name);

    return this.connection.send(() => EventFactory.loadScene(name));
  }

  async addCharacters(names: string[]) {
    const invalid = names.find((name) => !characterHasValidFormat(name));

    if (invalid) {
      throw Error(CHARACTER_HAS_INVALID_FORMAT);
    }

    return this.connection.send(() => EventFactory.loadCharacters(names));
  }

  async sendCustomPacket(getPacket: () => ProtoPacket) {
    await this.ensureOneToOneConversation();

    return this.oneToOneConversation.sendCustomPacket(getPacket);
  }

  async interrupt() {
    return this.connection.interrupt();
  }

  startConversation(characters: Character[]) {
    const service = new ConversationService(this.connection, { characters });

    this.connection.conversations.set(service.getConversationId(), {
      service,
      state: ConversationState.INACTIVE,
    });

    return service;
  }

  baseProtoPacket(props?: {
    utteranceId?: boolean;
    interactionId?: boolean;
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
        { characters: [character] },
      );

      this.addConversationToConnection(this.oneToOneConversation);
    }
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
