import { v4 } from 'uuid';

import {
  ActorType,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  Routing,
  TextEventSourceType,
} from '../../proto/packets.pb';
import { protoTimestamp } from '../common/helpers';
import { CancelResponsesProps } from '../common/interfaces';
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
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      dataChunk: { chunk: chunk as unknown as Uint8Array, type },
    };
  }

  audioSessionStart(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      control: { action: ControlEventAction.AUDIO_SESSION_START },
    };
  }

  audioSessionEnd(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      control: { action: ControlEventAction.AUDIO_SESSION_END },
    };
  }

  ttsPlaybackStart(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      control: { action: ControlEventAction.TTS_PLAYBACK_START },
    };
  }

  ttsPlaybackEnd(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      control: { action: ControlEventAction.TTS_PLAYBACK_END },
    };
  }

  ttsPlaybackMute(isMuted: boolean): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      control: {
        action: isMuted
          ? ControlEventAction.TTS_PLAYBACK_MUTE
          : ControlEventAction.TTS_PLAYBACK_UNMUTE,
      },
    };
  }

  text(text: string): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
        utteranceId: v4(),
        interactionId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      text: {
        sourceType: TextEventSourceType.TYPED_IN,
        text,
        final: true,
      },
    };
  }

  trigger(name: string, parameters: TriggerParameter[] = []): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
        utteranceId: v4(),
        interactionId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      custom: {
        name,
        ...(parameters.length && { parameters }),
      },
    };
  }

  cancelResponse(cancelResponses?: CancelResponsesProps): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
      cancelResponses,
    };
  }

  private routing(): Routing {
    return {
      source: { type: ActorType.PLAYER },
      target: { type: ActorType.AGENT, name: this.character?.id },
    };
  }
}
