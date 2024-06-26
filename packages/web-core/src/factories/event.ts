import { v4 } from 'uuid';

import {
  ActorType,
  Agent,
  AudioSessionStartPayloadMicrophoneMode,
  ControlEvent,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  LoadCharactersCharacterName,
  MutationEvent,
  Routing,
  SessionConfigurationPayload,
  TextEventSourceType,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  ConversationParticipant,
  MicrophoneMode,
  SendAudioSessionStartPacketParams,
  SendPacketParams,
  SendTriggerPacketParams,
  SessionControlProps,
} from '../common/data_structures';
import { protoTimestamp } from '../common/helpers';
import { Character } from '../entities/character.entity';

export interface SendCancelResponsePacketParams {
  interactionId?: string;
  utteranceId?: string[];
  character: Character;
}

export class EventFactory {
  private character: Character | undefined = undefined;
  private characters: Character[] = [];

  getCurrentCharacter() {
    return this.character;
  }

  setCurrentCharacter(character: Character) {
    this.character = character;
  }

  setCharacters(characters: Character[]) {
    this.characters = characters;
  }

  getCharacters() {
    return this.characters;
  }

  dataChunk(
    chunk: string,
    type: DataChunkDataType,
    params: SendPacketParams,
  ): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        conversationId: params.conversationId,
      }),
      dataChunk: { chunk: chunk as unknown as Uint8Array, type },
    };
  }

  audioSessionStart(params: SendAudioSessionStartPacketParams): ProtoPacket {
    return this.audioSession(ControlEventAction.AUDIO_SESSION_START, params);
  }

  audioSessionEnd(params: SendPacketParams): ProtoPacket {
    return this.audioSession(ControlEventAction.AUDIO_SESSION_END, params);
  }

  mutePlayback(isMuted: boolean, params: SendPacketParams): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        conversationId: params.conversationId,
      }),
      control: {
        action: isMuted
          ? ControlEventAction.TTS_PLAYBACK_MUTE
          : ControlEventAction.TTS_PLAYBACK_UNMUTE,
      },
    };
  }

  text(text: string, params: SendPacketParams): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        correlationId: true,
        conversationId: params.conversationId,
      }),
      text: {
        sourceType: TextEventSourceType.TYPED_IN,
        text,
        final: true,
      },
    };
  }

  trigger(name: string, params: SendTriggerPacketParams): ProtoPacket {
    const { parameters = [], character, conversationId } = params;

    return {
      ...this.baseProtoPacket({ correlationId: true, conversationId }),
      ...(character && {
        routing: this.routing({ character }),
      }),
      custom: {
        name,
        parameters: parameters.length ? parameters : undefined,
      },
    };
  }

  cancelResponse(params: SendCancelResponsePacketParams): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        correlationId: true,
      }),
      mutation: {
        cancelResponses: {
          interactionId: params.interactionId,
          utteranceId: params.utteranceId,
        },
      },
      routing: this.routing({ character: params.character }),
    };
  }

  narratedAction(content: string, params: SendPacketParams): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        correlationId: true,
        conversationId: params.conversationId,
      }),
      action: {
        narratedAction: {
          content,
        },
      },
    };
  }

  static conversation(
    participants: string[],
    params: SendPacketParams,
  ): ProtoPacket {
    const control = {
      action: ControlEventAction.CONVERSATION_UPDATE,
      conversationUpdate: {
        participants: participants.map((p) =>
          p === ConversationParticipant.USER
            ? {
                type: ActorType.PLAYER,
              }
            : {
                name: p,
                type: ActorType.AGENT,
              },
        ),
      },
    } as ControlEvent;

    return {
      packetId: {
        packetId: v4(),
        conversationId: params.conversationId,
      },
      timestamp: protoTimestamp(),
      control,
    };
  }

  static sessionControl(props: SessionControlProps): ProtoPacket {
    const sessionConfiguration = {
      ...(!!props.capabilities && {
        capabilitiesConfiguration: props.capabilities,
      }),
      ...(!!props.sessionConfiguration && {
        sessionConfiguration: props.sessionConfiguration,
      }),
      ...(!!props.clientConfiguration && {
        clientConfiguration: props.clientConfiguration,
      }),
      ...(!!props.userConfiguration && {
        userConfiguration: props.userConfiguration,
      }),
      ...(!!props.continuation && { continuation: props.continuation }),
    } as SessionConfigurationPayload;

    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.worldRouting(),
      ...(Object.keys(sessionConfiguration).length
        ? {
            control: {
              action: ControlEventAction.SESSION_CONFIGURATION,
              sessionConfiguration,
            },
          }
        : {
            ...(props.sessionHistory && {
              sessionControl: { sessionHistoryRequest: props.sessionHistory },
            }),
          }),
    };
  }

  static loadScene(name: string): ProtoPacket {
    const mutation = { loadScene: { name } } as MutationEvent;

    return {
      packetId: {
        packetId: v4(),
        interactionId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.worldRouting(),
      mutation,
    };
  }

  static loadCharacters(names: string[]): ProtoPacket {
    const name = names.map(
      (name) =>
        ({
          name,
        }) as LoadCharactersCharacterName,
    );

    const mutation = { loadCharacters: { name } } as MutationEvent;

    return {
      packetId: { packetId: v4() },
      timestamp: protoTimestamp(),
      routing: this.worldRouting(),
      mutation,
    };
  }

  static unloadCharacters(ids: string[]): ProtoPacket {
    const agents = ids.map((agentId) => ({ agentId }) as Agent);

    const mutation = { unloadCharacters: { agents } } as MutationEvent;

    return {
      packetId: { packetId: v4() },
      timestamp: protoTimestamp(),
      routing: this.worldRouting(),
      mutation,
    };
  }

  baseProtoPacket({
    utteranceId = true,
    interactionId = true,
    correlationId,
    conversationId,
  }: {
    utteranceId?: boolean;
    interactionId?: boolean;
    correlationId?: boolean;
    conversationId?: string;
  } = {}) {
    return {
      packetId: {
        packetId: v4(),
        ...(utteranceId && { utteranceId: v4() }),
        ...(interactionId && { interactionId: v4() }),
        ...(correlationId && { correlationId: v4() }),
        ...(conversationId && { conversationId }),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
    };
  }

  private audioSession(
    action:
      | ControlEventAction.AUDIO_SESSION_START
      | ControlEventAction.AUDIO_SESSION_END,
    params: SendAudioSessionStartPacketParams,
  ): ProtoPacket {
    let mode;

    if (action === ControlEventAction.AUDIO_SESSION_START) {
      mode =
        params.mode === MicrophoneMode.EXPECT_AUDIO_END
          ? AudioSessionStartPayloadMicrophoneMode.EXPECT_AUDIO_END
          : AudioSessionStartPayloadMicrophoneMode.OPEN_MIC;
    }

    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        conversationId: params.conversationId,
      }),
      control: {
        action,
        ...(mode && { audioSessionStart: { mode } }),
      },
    };
  }

  private routing(props?: { character: Character }): Routing {
    return {
      source: { type: ActorType.PLAYER },
      ...(props?.character && {
        target: { type: ActorType.AGENT, name: props.character.id },
      }),
    };
  }

  private static worldRouting(): Routing {
    return {
      source: { type: ActorType.PLAYER },
      target: { type: ActorType.WORLD },
    };
  }
}
