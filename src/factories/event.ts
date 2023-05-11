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
  TriggerParameter,
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

  ttsPlaybackMute(isMuted: boolean): ProtoPacket {
    return {
      packetId: {
        packetId: v4(),
      },
      timestamp: this.protoTimestampNow(),
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
      timestamp: this.protoTimestampNow(),
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
      timestamp: this.protoTimestampNow(),
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
      timestamp: this.protoTimestampNow(),
      routing: this.routing(),
      mutation: { cancelResponses },
    };
  }

  static fromProto(proto: ProtoPacket): InworldPacket {
    const packetId = proto.packetId;
    const routing = proto.routing;
    const source = routing.source;
    const target = routing.target;
    const type = this.getType(proto);
    const additionalPhonemeInfo = proto.dataChunk?.additionalPhonemeInfo ?? [];

    return new InworldPacket({
      type,
      date: proto.timestamp,
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
          name: proto.custom.name,
          parameters: proto.custom.parameters?.map((p) => ({
            name: p.name,
            value: p.value,
          })),
        },
      }),
      ...(type === InworldPacketType.TEXT && {
        text: {
          text: proto.text.text,
          final: proto.text.final,
        },
      }),
      ...(type === InworldPacketType.AUDIO && {
        audio: {
          chunk: proto.dataChunk.chunk as unknown as string,
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
          type: this.getControlType(proto),
        },
      }),
      ...(type === InworldPacketType.SILENCE && {
        silence: {
          durationMs: parseInt(proto.dataChunk.durationMs, 10),
        },
      }),
      ...(type === InworldPacketType.EMOTION && {
        emotions: {
          behavior: new EmotionBehavior(
            EmotionBehavior.fromProto(proto.emotion.behavior),
          ),
          strength: new EmotionStrength(
            EmotionStrength.fromProto(proto.emotion.strength),
          ),
        },
      }),
      ...(type === InworldPacketType.CANCEL_RESPONSE && {
        cancelResponses: {
          interactionId: proto.mutation.cancelResponses.interactionId,
          utteranceId: proto.mutation.cancelResponses.utteranceId,
        },
      }),
      ...(type === InworldPacketType.NARRATED_ACTION && {
        narratedAction: {
          text: proto.action.narratedAction.content,
        },
      }),
    });
  }

  private routing(): Routing {
    return {
      source: { type: ActorType.PLAYER },
      target: { type: ActorType.AGENT, name: this.character?.id },
    };
  }

  private protoTimestampNow = () => new Date().toISOString();

  private static getType(packet: ProtoPacket) {
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
    } else if (packet.mutation?.cancelResponses) {
      return InworldPacketType.CANCEL_RESPONSE;
    } else if (packet.action?.narratedAction) {
      return InworldPacketType.NARRATED_ACTION;
    } else {
      return InworldPacketType.UNKNOWN;
    }
  }

  private static getControlType(packet: ProtoPacket) {
    switch (packet.control.action) {
      case ControlEventAction.INTERACTION_END:
        return InworlControlType.INTERACTION_END;
      case ControlEventAction.TTS_PLAYBACK_START:
        return InworlControlType.TTS_PLAYBACK_START;
      case ControlEventAction.TTS_PLAYBACK_END:
        return InworlControlType.TTS_PLAYBACK_END;
      case ControlEventAction.TTS_PLAYBACK_MUTE:
        return InworlControlType.TTS_PLAYBACK_MUTE;
      case ControlEventAction.TTS_PLAYBACK_UNMUTE:
        return InworlControlType.TTS_PLAYBACK_UNMUTE;
      default:
        return InworlControlType.UNKNOWN;
    }
  }
}
