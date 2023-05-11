import { v4 } from 'uuid';

import {
  ActorType,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  Routing,
  TextEventSourceType,
} from '../../proto/packets.pb';
import { CancelResponsesProps } from '../common/data_structures';
import { protoTimestamp } from '../common/helpers';
import { Character } from '../entities/character.entity';
import { TriggerParameter } from '../entities/inworld_packet.entity';

export class EventFactory {
  private character: Character = null;

  getCurrentCharacter(): Character {
    return this.character;
  }

  setCurrentCharacter(character: Character) {
    this.character = character;
  }

  dataChunk(chunk: string, type: DataChunkDataType): ProtoPacket {
    return {
      ...this.baseProtoPacket({ utteranceId: false, interactionId: false }),
      dataChunk: { chunk: chunk as unknown as Uint8Array, type },
    };
  }

  audioSessionStart(): ProtoPacket {
    return {
      ...this.baseProtoPacket({ utteranceId: false, interactionId: false }),
      control: { action: ControlEventAction.AUDIO_SESSION_START },
    };
  }

  audioSessionEnd(): ProtoPacket {
    return {
      ...this.baseProtoPacket({ utteranceId: false, interactionId: false }),
      control: { action: ControlEventAction.AUDIO_SESSION_END },
    };
  }

  ttsPlaybackStart(): ProtoPacket {
    return {
      ...this.baseProtoPacket({ utteranceId: false, interactionId: false }),
      control: { action: ControlEventAction.TTS_PLAYBACK_START },
    };
  }

  ttsPlaybackEnd(): ProtoPacket {
    return {
      ...this.baseProtoPacket({ utteranceId: false, interactionId: false }),
      control: { action: ControlEventAction.TTS_PLAYBACK_END },
    };
  }

  ttsPlaybackMute(isMuted: boolean): ProtoPacket {
    return {
      ...this.baseProtoPacket({ utteranceId: false, interactionId: false }),
      control: {
        action: isMuted
          ? ControlEventAction.TTS_PLAYBACK_MUTE
          : ControlEventAction.TTS_PLAYBACK_UNMUTE,
      },
    };
  }

  text(text: string): ProtoPacket {
    return {
      ...this.baseProtoPacket(),
      text: {
        sourceType: TextEventSourceType.TYPED_IN,
        text,
        final: true,
      },
    };
  }

  trigger(name: string, parameters: TriggerParameter[] = []): ProtoPacket {
    return {
      ...this.baseProtoPacket(),
      custom: {
        name,
        ...(parameters.length && { parameters }),
      },
    };
  }

  cancelResponse(cancelResponses?: CancelResponsesProps): ProtoPacket {
    return {
      ...this.baseProtoPacket({ utteranceId: false, interactionId: false }),
      mutation: { cancelResponses },
    };
  }

  baseProtoPacket(props?: { utteranceId?: boolean; interactionId?: boolean }) {
    return {
      packetId: {
        packetId: v4(),
        ...((props?.utteranceId ?? true) && { utteranceId: v4() }),
        ...((props?.interactionId ?? true) && { interactionId: v4() }),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
    };
  }

  private routing(): Routing {
    return {
      source: { type: ActorType.PLAYER },
      target: { type: ActorType.AGENT, name: this.character?.id },
    };
  }
}
