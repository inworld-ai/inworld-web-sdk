import { v4 } from 'uuid';

import {
  Actor,
  ActorType,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  Routing,
  TextEventSourceType,
} from '../../proto/ai/inworld/packets/packets.pb';
import { CancelResponsesProps } from '../common/data_structures';
import { protoTimestamp } from '../common/helpers';
import { Character } from '../entities/character.entity';
import { TriggerParameter } from '../entities/inworld_packet.entity';

export class EventFactory {
  private character: Character | null = null;
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
    characters?: Character[],
  ): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        characters,
      }),
      dataChunk: { chunk: chunk as unknown as Uint8Array, type },
    };
  }

  audioSessionStart(characters?: Character[]): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        characters,
      }),
      control: { action: ControlEventAction.AUDIO_SESSION_START },
    };
  }

  audioSessionEnd(characters?: Character[]): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        characters,
      }),
      control: { action: ControlEventAction.AUDIO_SESSION_END },
    };
  }

  ttsPlaybackStart(characters?: Character[]): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        characters,
      }),
      control: { action: ControlEventAction.TTS_PLAYBACK_START },
    };
  }

  ttsPlaybackEnd(characters?: Character[]): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        characters,
      }),
      control: { action: ControlEventAction.TTS_PLAYBACK_END },
    };
  }

  ttsPlaybackMute(isMuted: boolean, characters?: Character[]): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        characters,
      }),
      control: {
        action: isMuted
          ? ControlEventAction.TTS_PLAYBACK_MUTE
          : ControlEventAction.TTS_PLAYBACK_UNMUTE,
      },
    };
  }

  text(text: string, characters?: Character[]): ProtoPacket {
    return {
      ...this.baseProtoPacket({ correlationId: true, characters }),
      text: {
        sourceType: TextEventSourceType.TYPED_IN,
        text,
        final: true,
      },
    };
  }

  trigger(
    name: string,
    {
      parameters = [],
      characters,
    }: {
      parameters?: TriggerParameter[];
      characters?: Character[];
    } = {},
  ): ProtoPacket {
    return {
      ...this.baseProtoPacket({ correlationId: true, characters }),
      custom: {
        name,
        parameters: parameters.length ? parameters : undefined,
      },
    };
  }

  cancelResponse(
    cancelResponses?: CancelResponsesProps,
    characters?: Character[],
  ): ProtoPacket {
    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        correlationId: true,
        characters,
      }),
      mutation: { cancelResponses },
    };
  }

  narratedAction(content: string, characters?: Character[]): ProtoPacket {
    return {
      ...this.baseProtoPacket({ correlationId: true, characters }),
      action: {
        narratedAction: {
          content,
        },
      },
    };
  }

  baseProtoPacket({
    utteranceId = true,
    interactionId = true,
    correlationId,
    characters,
  }: {
    utteranceId?: boolean;
    interactionId?: boolean;
    correlationId?: boolean;
    characters?: Character[];
  } = {}) {
    return {
      packetId: {
        packetId: v4(),
        ...(utteranceId && { utteranceId: v4() }),
        ...(interactionId && { interactionId: v4() }),
        ...(correlationId && { correlationId: v4() }),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(characters),
    };
  }

  private routing(characters?: Character[]): Routing {
    const targets: Actor[] = [];
    const currentCharacter = this.getCurrentCharacter();

    if (!!currentCharacter?.id) {
      targets.push({ type: ActorType.AGENT, name: currentCharacter.id });
    } else {
      (characters ?? this.characters).forEach((c) =>
        targets.push({ type: ActorType.AGENT, name: c.id }),
      );
    }

    return {
      source: { type: ActorType.PLAYER },
      targets,
    };
  }
}
