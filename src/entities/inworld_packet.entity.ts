import { EmotionBehavior } from './emotion-behavior.entity';
import { EmotionStrength } from './emotion-strength.entity';

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

  date: string;
  packetId: PacketId;
  routing: Routing;

  // Events
  text: TextEvent;
  audio: AudioEvent;
  trigger: TriggerEvent;
  control: ControlEvent;
  emotions: EmotionEvent;
  silence: SilenceEvent;
  narratedAction: NarratedAction;
  cancelResponses: CancelResponsesEvent;

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

    if (this.isNarratedAction) {
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
}
