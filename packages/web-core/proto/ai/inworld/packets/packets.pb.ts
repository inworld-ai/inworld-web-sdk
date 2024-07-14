/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as GoogleProtobufDuration from "../../../google/protobuf/duration.pb"
import * as GoogleProtobufStruct from "../../../google/protobuf/struct.pb"
import * as GoogleProtobufTimestamp from "../../../google/protobuf/timestamp.pb"
import * as GoogleRpcStatus from "../../../google/rpc/status.pb"
import * as AiInworldEngineConfigurationConfiguration from "../engine/configuration/configuration.pb"
import * as AiInworldLanguage_codesLanguage_codes from "../language_codes/language_codes.pb"
import * as AiInworldPacketsEntitiesEntities_packets from "./entities_packets.pb"

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
  WORLD = "WORLD",
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
  CONVERSATION_START = "CONVERSATION_START",
  CONVERSATION_UPDATE = "CONVERSATION_UPDATE",
  CONVERSATION_STARTED = "CONVERSATION_STARTED",
  CONVERSATION_EVENT = "CONVERSATION_EVENT",
  CURRENT_SCENE_STATUS = "CURRENT_SCENE_STATUS",
  SESSION_CONFIGURATION = "SESSION_CONFIGURATION",
}

export enum AudioSessionStartPayloadMicrophoneMode {
  UNSPECIFIED = "UNSPECIFIED",
  OPEN_MIC = "OPEN_MIC",
  EXPECT_AUDIO_END = "EXPECT_AUDIO_END",
}

export enum AudioSessionStartPayloadUnderstandingMode {
  UNSPECIFIED_UNDERSTANDING_MODE = "UNSPECIFIED_UNDERSTANDING_MODE",
  FULL = "FULL",
  SPEECH_RECOGNITION_ONLY = "SPEECH_RECOGNITION_ONLY",
}

export enum CustomEventType {
  UNSPECIFIED = "UNSPECIFIED",
  TRIGGER = "TRIGGER",
  TASK = "TASK",
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
  NVIDIA_A2F_ANIMATION = "NVIDIA_A2F_ANIMATION",
  NVIDIA_A2F_ANIMATION_HEADER = "NVIDIA_A2F_ANIMATION_HEADER",
  INSPECT = "INSPECT",
}

export enum DataChunkAudioFormat {
  UNSPECIFIED_AUDIO_FORMAT = "UNSPECIFIED_AUDIO_FORMAT",
  AUDIO_MP3 = "AUDIO_MP3",
  AUDIO_PCM_16000 = "AUDIO_PCM_16000",
  AUDIO_PCM_22050 = "AUDIO_PCM_22050",
}

export enum PingPongReportType {
  UNSPECIFIED = "UNSPECIFIED",
  PING = "PING",
  PONG = "PONG",
}

export enum PerceivedLatencyReportPrecision {
  UNSPECIFIED = "UNSPECIFIED",
  FINE = "FINE",
  ESTIMATED = "ESTIMATED",
  PUSH_TO_TALK = "PUSH_TO_TALK",
  NON_SPEECH = "NON_SPEECH",
}

export enum ApplyResponseApplyResponseType {
  APPLY_RESPONSE_TYPE_DEFAULT = "APPLY_RESPONSE_TYPE_DEFAULT",
  APPLY_RESPONSE_TYPE_COMMIT = "APPLY_RESPONSE_TYPE_COMMIT",
}

export enum ContinuationContinuationType {
  CONTINUATION_TYPE_UNKNOWN = "CONTINUATION_TYPE_UNKNOWN",
  CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE = "CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE",
  CONTINUATION_TYPE_DIALOG_HISTORY = "CONTINUATION_TYPE_DIALOG_HISTORY",
}

export enum ConversationEventPayloadConversationEventType {
  UNKNOWN = "UNKNOWN",
  STARTED = "STARTED",
  UPDATED = "UPDATED",
  EVICTED = "EVICTED",
}

export type Actor = {
  type?: ActorType
  name?: string
}

export type Routing = {
  source?: Actor
  target?: Actor
  targets?: Actor[]
}

export type PacketId = {
  packetId?: string
  utteranceId?: string
  interactionId?: string
  correlationId?: string
  conversationId?: string
}


type BaseInworldPacket = {
  timestamp?: GoogleProtobufTimestamp.Timestamp
  routing?: Routing
  packetId?: PacketId
}

export type InworldPacket = BaseInworldPacket
  & OneOf<{ text: TextEvent; control: ControlEvent; audioChunk: AudioChunk; custom: CustomEvent; cancelResponses: CancelResponsesEvent; emotion: EmotionEvent; dataChunk: DataChunk; action: ActionEvent; mutation: MutationEvent; loadSceneOutput: LoadSceneOutputEvent; debugInfo: DebugInfoEvent; sessionControl: SessionControlEvent; sessionControlResponse: SessionControlResponseEvent; latencyReport: LatencyReportEvent; operationStatus: OperationStatusEvent; entitiesItemsOperation: AiInworldPacketsEntitiesEntities_packets.ItemsOperationEvent }>

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


type BaseControlEvent = {
  action?: ControlEventAction
  description?: string
  payload?: GoogleProtobufStruct.Struct
}

export type ControlEvent = BaseControlEvent
  & OneOf<{ conversationUpdate: ConversationUpdatePayload; conversationEvent: ConversationEventPayload; audioSessionStart: AudioSessionStartPayload; currentSceneStatus: CurrentSceneStatus; sessionConfiguration: SessionConfigurationPayload }>

export type AudioSessionStartPayload = {
  mode?: AudioSessionStartPayloadMicrophoneMode
  understandingMode?: AudioSessionStartPayloadUnderstandingMode
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
  type?: CustomEventType
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


type BaseLatencyReportEvent = {
}

export type LatencyReportEvent = BaseLatencyReportEvent
  & OneOf<{ pingPong: PingPongReport; perceivedLatency: PerceivedLatencyReport }>

export type PingPongReport = {
  type?: PingPongReportType
  pingPacketId?: PacketId
  pingTimestamp?: GoogleProtobufTimestamp.Timestamp
}

export type PerceivedLatencyReport = {
  precision?: PerceivedLatencyReportPrecision
  latency?: GoogleProtobufDuration.Duration
}


type BaseMutationEvent = {
}

export type MutationEvent = BaseMutationEvent
  & OneOf<{ cancelResponses: CancelResponses; regenerateResponse: RegenerateResponse; applyResponse: ApplyResponse; loadScene: LoadScene; modifyExactResponse: ModifyExactResponse; loadCharacters: LoadCharacters; unloadCharacters: UnloadCharacters }>


type BaseSessionControlResponseEvent = {
}

export type SessionControlResponseEvent = BaseSessionControlResponseEvent
  & OneOf<{ loadedScene: LoadedScene; loadedCharacters: LoadedCharacters; sessionHistory: SessionHistoryResponse }>

export type CancelResponses = {
  interactionId?: string
  utteranceId?: string[]
}

export type RegenerateResponse = {
  interactionId?: string
}

export type ApplyResponse = {
  packetId?: PacketId
  applyResponseType?: ApplyResponseApplyResponseType
}

export type LoadScene = {
  name?: string
}

export type LoadedScene = {
  agents?: Agent[]
  sceneName?: string
  sceneDescription?: string
  sceneDisplayName?: string
}

export type LoadCharactersCharacterName = {
  name?: string
  languageCode?: AiInworldLanguage_codesLanguage_codes.LanguageCode
}

export type LoadCharacters = {
  name?: LoadCharactersCharacterName[]
}

export type LoadedCharacters = {
  agents?: Agent[]
  sceneName?: string
  sceneDescription?: string
  sceneDisplayName?: string
}

export type UnloadCharacters = {
  agents?: Agent[]
}

export type CurrentSceneStatus = {
  agents?: Agent[]
  sceneName?: string
  sceneDescription?: string
  sceneDisplayName?: string
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

export type AgentCharacterAssets = {
  rpmModelUri?: string
  rpmImageUriPortrait?: string
  rpmImageUriPosture?: string
  avatarImg?: string
  avatarImgOriginal?: string
}

export type Agent = {
  agentId?: string
  brainName?: string
  givenName?: string
  characterAssets?: AgentCharacterAssets
}


type BaseDebugInfoEvent = {
}

export type DebugInfoEvent = BaseDebugInfoEvent
  & OneOf<{ relation: RelationInfo }>


type BaseSessionControlEvent = {
}

export type SessionControlEvent = BaseSessionControlEvent
  & OneOf<{ sessionConfiguration: AiInworldEngineConfigurationConfiguration.SessionConfiguration; userConfiguration: AiInworldEngineConfigurationConfiguration.UserConfiguration; clientConfiguration: AiInworldEngineConfigurationConfiguration.ClientConfiguration; capabilitiesConfiguration: AiInworldEngineConfigurationConfiguration.CapabilitiesConfiguration; continuation: Continuation; sessionHistoryRequest: SessionHistoryRequest; sessionConfigurationPayload: SessionConfigurationPayload }>

export type SessionConfigurationPayload = {
  sessionConfiguration?: AiInworldEngineConfigurationConfiguration.SessionConfiguration
  userConfiguration?: AiInworldEngineConfigurationConfiguration.UserConfiguration
  clientConfiguration?: AiInworldEngineConfigurationConfiguration.ClientConfiguration
  capabilitiesConfiguration?: AiInworldEngineConfigurationConfiguration.CapabilitiesConfiguration
  continuation?: Continuation
}

export type ContinuationContinuationInfo = {
  passedTime?: GoogleProtobufTimestamp.Timestamp
}

export type Continuation = {
  continuationInfo?: ContinuationContinuationInfo
  continuationType?: ContinuationContinuationType
  dialogHistory?: DialogHistory
  externallySavedState?: Uint8Array
}

export type DialogHistoryHistoryItem = {
  actor?: Actor
  text?: string
}

export type DialogHistory = {
  history?: DialogHistoryHistoryItem[]
}

export type RelationsRelation = {
  type?: string
  label?: string
}

export type Relations = {
  actor?: Actor
  relations?: RelationsRelation[]
}

export type SessionHistoryRequest = {
}

export type SessionHistoryResponseSessionHistoryItem = {
  agent?: Agent
  packets?: InworldPacket[]
}

export type SessionHistoryResponse = {
  sessionHistoryItems?: SessionHistoryResponseSessionHistoryItem[]
}

export type ConversationUpdatePayload = {
  participants?: Actor[]
}

export type ConversationEventPayload = {
  participants?: Actor[]
  eventType?: ConversationEventPayloadConversationEventType
}

export type OperationStatusEvent = {
  status?: GoogleRpcStatus.Status
}