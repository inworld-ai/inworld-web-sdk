/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as GoogleProtobufDuration from "./google/protobuf/duration.pb"
import * as GoogleProtobufStruct from "./google/protobuf/struct.pb"
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb"

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };
type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (
    keyof T extends infer K ?
      (K extends string & keyof T ? { [k in K]: T[K] } & Absent<T, K>
        : never)
    : never);

export enum Playback {
  UNSPECIFIED = "UNSPECIFIED",
  INTERACTION = "INTERACTION",
  INTERACTION_END = "INTERACTION_END",
  UTTERANCE = "UTTERANCE",
}

export enum ActorType {
  UNKNOWN = "UNKNOWN",
  PLAYER = "PLAYER",
  AGENT = "AGENT",
}

export enum TextEventSourceType {
  UNKNOWN = "UNKNOWN",
  SPEECH_TO_TEXT = "SPEECH_TO_TEXT",
  TYPED_IN = "TYPED_IN",
  GENERATED = "GENERATED",
  FILLER = "FILLER",
}

export enum ControlEventAction {
  UNKNOWN = "UNKNOWN",
  AUDIO_SESSION_START = "AUDIO_SESSION_START",
  AUDIO_SESSION_END = "AUDIO_SESSION_END",
  INTERACTION_END = "INTERACTION_END",
  TTS_PLAYBACK_START = "TTS_PLAYBACK_START",
  TTS_PLAYBACK_END = "TTS_PLAYBACK_END",
  TTS_PLAYBACK_MUTE = "TTS_PLAYBACK_MUTE",
  TTS_PLAYBACK_UNMUTE = "TTS_PLAYBACK_UNMUTE",
  WARNING = "WARNING",
  SESSION_END = "SESSION_END",
}

export enum EmotionEventSpaffCode {
  NEUTRAL = "NEUTRAL",
  DISGUST = "DISGUST",
  CONTEMPT = "CONTEMPT",
  BELLIGERENCE = "BELLIGERENCE",
  DOMINEERING = "DOMINEERING",
  CRITICISM = "CRITICISM",
  ANGER = "ANGER",
  TENSION = "TENSION",
  TENSE_HUMOR = "TENSE_HUMOR",
  DEFENSIVENESS = "DEFENSIVENESS",
  WHINING = "WHINING",
  SADNESS = "SADNESS",
  STONEWALLING = "STONEWALLING",
  INTEREST = "INTEREST",
  VALIDATION = "VALIDATION",
  AFFECTION = "AFFECTION",
  HUMOR = "HUMOR",
  SURPRISE = "SURPRISE",
  JOY = "JOY",
}

export enum EmotionEventStrength {
  UNSPECIFIED = "UNSPECIFIED",
  WEAK = "WEAK",
  STRONG = "STRONG",
  NORMAL = "NORMAL",
}

export enum DataChunkDataType {
  UNSPECIFIED = "UNSPECIFIED",
  AUDIO = "AUDIO",
  SILENCE = "SILENCE",
  STATE = "STATE",
}

export enum DataChunkAudioFormat {
  UNSPECIFIED_AUDIO_FORMAT = "UNSPECIFIED_AUDIO_FORMAT",
  AUDIO_MP3 = "AUDIO_MP3",
  AUDIO_PCM_16000 = "AUDIO_PCM_16000",
  AUDIO_PCM_22050 = "AUDIO_PCM_22050",
}

export type Actor = {
  type?: ActorType
  name?: string
}

export type Routing = {
  source?: Actor
  target?: Actor
}

export type PacketId = {
  packetId?: string
  utteranceId?: string
  interactionId?: string
  correlationId?: string
}


type BaseInworldPacket = {
  timestamp?: GoogleProtobufTimestamp.Timestamp
  routing?: Routing
  packetId?: PacketId
}

export type InworldPacket = BaseInworldPacket
  & OneOf<{ text: TextEvent; control: ControlEvent; audioChunk: AudioChunk; custom: CustomEvent; cancelResponses: CancelResponsesEvent; emotion: EmotionEvent; dataChunk: DataChunk; action: ActionEvent; mutation: MutationEvent; loadSceneOutput: LoadSceneOutputEvent; debugInfo: DebugInfoEvent }>

export type TextEventModelInfo = {
  service?: string
  model?: string
}

export type TextEvent = {
  text?: string
  sourceType?: TextEventSourceType
  final?: boolean
  modelInfo?: TextEventModelInfo
}

export type ControlEvent = {
  action?: ControlEventAction
  description?: string
  payload?: GoogleProtobufStruct.Struct
}

export type AudioChunk = {
  chunk?: Uint8Array
}

export type CustomEventParameter = {
  name?: string
  value?: string
}

export type CustomEvent = {
  name?: string
  playback?: Playback
  parameters?: CustomEventParameter[]
}

export type CancelResponsesEvent = {
  interactionId?: string
  utteranceId?: string[]
}

export type EmotionEvent = {
  joy?: number
  fear?: number
  trust?: number
  surprise?: number
  behavior?: EmotionEventSpaffCode
  strength?: EmotionEventStrength
}


type BaseDataChunk = {
  type?: DataChunkDataType
  additionalPhonemeInfo?: AdditionalPhonemeInfo[]
  audioFormat?: DataChunkAudioFormat
}

export type DataChunk = BaseDataChunk
  & OneOf<{ chunk: Uint8Array; durationMs: string }>

export type AdditionalPhonemeInfo = {
  phoneme?: string
  startOffset?: GoogleProtobufDuration.Duration
}


type BaseActionEvent = {
  playback?: Playback
}

export type ActionEvent = BaseActionEvent
  & OneOf<{ narratedAction: NarratedAction }>

export type NarratedAction = {
  content?: string
}

export type RelationInfoRelationAttributes = {
  trust?: number
  respect?: number
  familiar?: number
  flirtatious?: number
  attraction?: number
}

export type RelationInfo = {
  relationState?: RelationInfoRelationAttributes
  relationUpdate?: RelationInfoRelationAttributes
}


type BaseMutationEvent = {
}

export type MutationEvent = BaseMutationEvent
  & OneOf<{ cancelResponses: CancelResponses; regenerateResponse: RegenerateResponse; applyResponse: ApplyResponse; loadScene: LoadScene; modifyExactResponse: ModifyExactResponse }>

export type CancelResponses = {
  interactionId?: string
  utteranceId?: string[]
}

export type RegenerateResponse = {
  interactionId?: string
}

export type ApplyResponse = {
  packetId?: PacketId
}

export type LoadScene = {
  name?: string
}

export type ModifyExactResponse = {
  interactionId?: string
  exactText?: string
}

export type LoadSceneOutputEventAgent = {
  agentId?: string
  brainName?: string
  givenName?: string
}

export type LoadSceneOutputEvent = {
  agents?: LoadSceneOutputEventAgent[]
}


type BaseDebugInfoEvent = {
}

export type DebugInfoEvent = BaseDebugInfoEvent
  & OneOf<{ relation: RelationInfo }>