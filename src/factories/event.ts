import { v4 } from 'uuid';

import {
  ActorType,
  AdditionalPhonemeInfo as ProtoAdditionalPhonemeInfo,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  Routing,
  TextEventSourceType,
} from '../../proto/packets.pb';
import { CancelResponsesProps } from '../common/interfaces';
import { Character } from '../entities/character.entity';
import { EmotionBehavior } from '../entities/emotion-behavior.entity';
import { EmotionStrength } from '../entities/emotion-strength.entity';
import {
  AdditionalPhonemeInfo,
  InworlControlType,
  InworldPacket,
  InworldPacketType,
} from '../entities/inworld_packet.entity';

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
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      dataChunk: { chunk: chunk as unknown as Uint8Array, type },
    };
  }

  audioSessionStart(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      control: { action: ControlEventAction.AUDIO_SESSION_START },
    };
  }

  audioSessionEnd(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      control: { action: ControlEventAction.AUDIO_SESSION_END },
    };
  }

  ttsPlaybackStart(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      control: { action: ControlEventAction.TTS_PLAYBACK_START },
    };
  }

  ttsPlaybackEnd(): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      control: { action: ControlEventAction.TTS_PLAYBACK_END },
    };
  }

  text(text: string): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
        utteranceId: v4(),
        interactionId: v4(),
      },
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      text: {
        sourceType: TextEventSourceType.TYPED_IN,
        text,
        final: true,
      },
    };
  }

  trigger(name: string): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
        utteranceId: v4(),
        interactionId: v4(),
      },
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      custom: { name },
    };
  }

  cancelResponse(cancelResponses?: CancelResponsesProps): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      cancelResponses,
    };
  }

  convertToInworldPacket(packet: ProtoPacket): InworldPacket {
    const packetId = packet.packetId;
    const routing = packet.routing;
    const source = routing.source;
    const target = routing.target;
    const type = this.getType(packet);
    const additionalPhonemeInfo = packet.dataChunk?.additionalPhonemeInfo ?? [];

    return new InworldPacket({
      type,
      date: packet.timestamp,
      packetId: {
        packetId: packetId.packetId,
        utteranceId: packetId.utteranceId,
        interactionId: packetId.interactionId,
      },
      routing: {
        source: {
          name: source.name,
          isPlayer: source.type === ActorType.PLAYER,
          isCharacter: source.type === ActorType.AGENT,
        },
        target: {
          name: target.name,
          isPlayer: target.type === ActorType.PLAYER,
          isCharacter: target.type === ActorType.AGENT,
        },
      },
      ...(type === InworldPacketType.TRIGGER && {
        trigger: {
          name: packet.custom.name,
        },
      }),
      ...(type === InworldPacketType.TEXT && {
        text: {
          text: packet.text.text,
          final: packet.text.final,
        },
      }),
      ...(type === InworldPacketType.AUDIO && {
        audio: {
          chunk: packet.dataChunk.chunk as unknown as string,
          additionalPhonemeInfo: additionalPhonemeInfo.map(
            (info: ProtoAdditionalPhonemeInfo) =>
              ({
                phoneme: info.phoneme,
                startOffsetS: parseFloat(info.startOffset),
              } as AdditionalPhonemeInfo),
          ),
        },
      }),
      ...(type === InworldPacketType.CONTROL && {
        control: {
          type: this.getControlType(packet),
        },
      }),
      ...(type === InworldPacketType.SILENCE && {
        silence: {
          durationMs: parseInt(packet.dataChunk.durationMs, 10),
        },
      }),
      ...(type === InworldPacketType.EMOTION && {
        emotions: {
          behavior: new EmotionBehavior(packet.emotion.behavior),
          strength: new EmotionStrength(packet.emotion.strength),
        },
      }),
      ...(type === InworldPacketType.CANCEL_RESPONSE && {
        cancelResponses: {
          interactionId: packet.cancelResponses.interactionId,
          utteranceId: packet.cancelResponses.utteranceId,
        },
      }),
      ...(type === InworldPacketType.NARRATED_ACTION && {
        narratedAction: {
          text: packet.action.narratedAction.content,
        },
      }),
    });
  }

  private routing(): Routing {
    return {
      source: { type: ActorType.PLAYER },
      target: { type: ActorType.AGENT, name: this.character?.getId() },
    };
  }

  private protoTimestampNow = () => new Date().toISOString();

  private getType(packet: ProtoPacket) {
    if (packet.text) {
      return InworldPacketType.TEXT;
    } else if (
      packet.dataChunk &&
      packet.dataChunk.type === DataChunkDataType.AUDIO
    ) {
      return InworldPacketType.AUDIO;
    } else if (
      packet.dataChunk &&
      packet.dataChunk.type === DataChunkDataType.SILENCE
    ) {
      return InworldPacketType.SILENCE;
    } else if (packet.custom) {
      return InworldPacketType.TRIGGER;
    } else if (packet.control) {
      return InworldPacketType.CONTROL;
    } else if (packet.emotion) {
      return InworldPacketType.EMOTION;
    } else if (packet.cancelResponses) {
      return InworldPacketType.CANCEL_RESPONSE;
    } else if (packet.action?.narratedAction) {
      return InworldPacketType.NARRATED_ACTION;
    } else {
      return InworldPacketType.UNKNOWN;
    }
  }

  private getControlType(packet: ProtoPacket) {
    switch (packet.control.action) {
      case ControlEventAction.INTERACTION_END:
        return InworlControlType.INTERACTION_END;
      case ControlEventAction.TTS_PLAYBACK_START:
        return InworlControlType.TTS_PLAYBACK_START;
      case ControlEventAction.TTS_PLAYBACK_END:
        return InworlControlType.TTS_PLAYBACK_END;
      default:
        return InworlControlType.UNKNOWN;
    }
  }
}
