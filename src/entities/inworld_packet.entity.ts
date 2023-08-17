import {
  ActorType,
  AdditionalPhonemeInfo as ProtoAdditionalPhonemeInfo,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
} from '../../proto/packets.pb';
import { EmotionBehavior } from './emotion_behavior.entity';
import { EmotionStrength } from './emotion_strength.entity';

export enum InworldPacketType {
  UNKNOWN = 'UNKNOWN',
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  TRIGGER = 'TRIGGER',
  EMOTION = 'EMOTION',
  CONTROL = 'CONTROL',
  SILENCE = 'SILENCE',
  CANCEL_RESPONSE = 'CANCEL_RESPONSE',
  NARRATED_ACTION = 'NARRATED_ACTION',
}

export enum InworlControlType {
  UNKNOWN = 'UNKNOWN',
  INTERACTION_END = 'INTERACTION_END',
  TTS_PLAYBACK_START = 'TTS_PLAYBACK_START',
  TTS_PLAYBACK_END = 'TTS_PLAYBACK_END',
  TTS_PLAYBACK_MUTE = 'TTS_PLAYBACK_MUTE',
  TTS_PLAYBACK_UNMUTE = 'TTS_PLAYBACK_UNMUTE',
}

export interface InworldPacketProps {
  audio?: AudioEvent;
  cancelResponses?: CancelResponsesEvent;
  control?: ControlEvent;
  trigger?: TriggerEvent;
  emotions?: EmotionEvent;
  packetId: PacketId;
  routing: Routing;
  silence?: SilenceEvent;
  text?: TextEvent;
  narratedAction?: NarratedAction;
  date: string;
  type: InworldPacketType;
}

export interface PacketId {
  packetId: string;
  utteranceId: string;
  interactionId: string;
}

export interface EmotionEvent {
  behavior: EmotionBehavior;
  strength: EmotionStrength;
}

export interface Routing {
  source: Actor;
  target: Actor;
}

export interface Actor {
  name: string;
  isPlayer: boolean;
  isCharacter: boolean;
}

export interface TriggerParameter {
  name: string;
  value: string;
}

export interface TextEvent {
  text: string;
  final: boolean;
}

export interface TriggerEvent {
  name: string;
  parameters?: TriggerParameter[];
}

export interface AdditionalPhonemeInfo {
  phoneme?: string;
  startOffsetS?: number;
}

export interface AudioEvent {
  chunk: string;
  // Available only when metadata is loaded.
  // I.e. before audio playing.
  durationMs?: number;
  additionalPhonemeInfo?: AdditionalPhonemeInfo[];
}

export interface SilenceEvent {
  durationMs: number;
}

export interface CancelResponsesEvent {
  interactionId?: string;
  utteranceId?: string[];
}

export interface ControlEvent {
  type: InworlControlType;
}

export interface NarratedAction {
  text: string;
}

export class InworldPacket {
  private type: InworldPacketType = InworldPacketType.UNKNOWN;

  readonly date: string;
  readonly packetId: PacketId;
  readonly routing: Routing;

  // Events
  readonly text: TextEvent;
  readonly audio: AudioEvent;
  readonly trigger: TriggerEvent;
  readonly control: ControlEvent;
  readonly emotions: EmotionEvent;
  readonly silence: SilenceEvent;
  readonly narratedAction: NarratedAction;
  readonly cancelResponses: CancelResponsesEvent;

  constructor(props: InworldPacketProps) {
    this.packetId = props.packetId;
    this.routing = props.routing;
    this.date = props.date;
    this.type = props.type;

    if (this.isText()) {
      this.text = props.text;
    }

    if (this.isAudio()) {
      this.audio = props.audio;
    }

    if (this.isControl()) {
      this.control = props.control;
    }

    if (this.isEmotion()) {
      this.emotions = props.emotions;
    }

    if (this.isTrigger()) {
      this.trigger = props.trigger;
    }

    if (this.isSilence()) {
      this.silence = props.silence;
    }

    if (this.isCancelResponse()) {
      this.cancelResponses = props.cancelResponses;
    }

    if (this.isNarratedAction()) {
      this.narratedAction = props.narratedAction;
    }
  }

  isText() {
    return this.type === InworldPacketType.TEXT;
  }

  isAudio() {
    return this.type === InworldPacketType.AUDIO;
  }

  isControl() {
    return this.type === InworldPacketType.CONTROL;
  }

  isTrigger() {
    return this.type === InworldPacketType.TRIGGER;
  }

  isEmotion() {
    return this.type === InworldPacketType.EMOTION;
  }

  isInteractionEnd() {
    return (
      this.isControl() &&
      this.control.type === InworlControlType.INTERACTION_END
    );
  }

  isTTSPlaybackStart() {
    return (
      this.isControl() &&
      this.control.type === InworlControlType.TTS_PLAYBACK_START
    );
  }

  isTTSPlaybackEnd() {
    return (
      this.isControl() &&
      this.control.type === InworlControlType.TTS_PLAYBACK_END
    );
  }

  isTTSPlaybackMute() {
    return (
      this.isControl() &&
      this.control.type === InworlControlType.TTS_PLAYBACK_MUTE
    );
  }

  isTTSPlaybackUnmute() {
    return (
      this.isControl() &&
      this.control.type === InworlControlType.TTS_PLAYBACK_UNMUTE
    );
  }

  isSilence() {
    return this.type === InworldPacketType.SILENCE;
  }

  isCancelResponse() {
    return this.type === InworldPacketType.CANCEL_RESPONSE;
  }

  isNarratedAction() {
    return this.type === InworldPacketType.NARRATED_ACTION;
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
