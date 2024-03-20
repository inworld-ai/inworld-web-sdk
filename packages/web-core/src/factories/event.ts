import { v4 } from 'uuid';

import {
  ActorType,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  MutationEvent,
  Routing,
  SessionControlEvent,
  TextEventSourceType,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  CancelResponsesProps,
  SessionControlProps,
  TriggerParameter,
} from '../common/data_structures';
import { protoTimestamp } from '../common/helpers';
import { Character } from '../entities/character.entity';

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

  static sessionControl(props: SessionControlProps): ProtoPacket {
    const sessionControl = {
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
      ...(!!props.sessionHistory && {
        sessionHistoryRequest: props.sessionHistory,
      }),
    } as SessionControlEvent;

    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.openSessionRouting(),
      sessionControl,
    };
  }

  static loadScene(name: string): ProtoPacket {
    const mutation = {
      loadScene: {
        name,
      },
    } as MutationEvent;

    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.openSessionRouting(),
      mutation,
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
    const currentCharacter = this.getCurrentCharacter();

    if (!!currentCharacter?.id) {
      return {
        source: { type: ActorType.PLAYER },
        target: { type: ActorType.AGENT, name: currentCharacter.id },
      };
    } else {
      return {
        source: { type: ActorType.PLAYER },
        targets: (characters ?? this.characters).map((c) => ({
          type: ActorType.AGENT,
          name: c.id,
        })),
      };
    }
  }

  private static openSessionRouting(): Routing {
    return {
      source: { type: ActorType.PLAYER },
      target: { type: ActorType.WORLD },
    };
  }
}
