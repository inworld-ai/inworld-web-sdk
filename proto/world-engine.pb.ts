/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "./fetch.pb"
import * as GoogleProtobufEmpty from "./google/protobuf/empty.pb"
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb"
import * as AiInworldPacketsPackets from "./packets.pb"
import * as AiInworldVoicesVoices from "./voices.pb"

export enum InteractionDislikeType {
  DISLIKE_TYPE_UNSPECIFIED = "DISLIKE_TYPE_UNSPECIFIED",
  DISLIKE_TYPE_IRRELEVANT = "DISLIKE_TYPE_IRRELEVANT",
  DISLIKE_TYPE_UNSAFE = "DISLIKE_TYPE_UNSAFE",
  DISLIKE_TYPE_UNTRUE = "DISLIKE_TYPE_UNTRUE",
  DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE = "DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE",
  DISLIKE_TYPE_UNEXPECTED_ACTION = "DISLIKE_TYPE_UNEXPECTED_ACTION",
  DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR = "DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR",
  DISLIKE_TYPE_REPETITION = "DISLIKE_TYPE_REPETITION",
}

export enum VoicePreset {
  VOICE_PRESET_UNSPECIFIED = "VOICE_PRESET_UNSPECIFIED",
  VOICE_PRESET_FEMALE_1 = "VOICE_PRESET_FEMALE_1",
  VOICE_PRESET_FEMALE_2 = "VOICE_PRESET_FEMALE_2",
  VOICE_PRESET_FEMALE_3 = "VOICE_PRESET_FEMALE_3",
  VOICE_PRESET_FEMALE_4 = "VOICE_PRESET_FEMALE_4",
  VOICE_PRESET_FEMALE_5 = "VOICE_PRESET_FEMALE_5",
  VOICE_PRESET_MALE_1 = "VOICE_PRESET_MALE_1",
  VOICE_PRESET_MALE_2 = "VOICE_PRESET_MALE_2",
  VOICE_PRESET_MALE_3 = "VOICE_PRESET_MALE_3",
  VOICE_PRESET_MALE_4 = "VOICE_PRESET_MALE_4",
  VOICE_PRESET_MALE_5 = "VOICE_PRESET_MALE_5",
  INWORLD_VOICE_PRESET_MALE_1 = "INWORLD_VOICE_PRESET_MALE_1",
  INWORLD_VOICE_PRESET_MALE_2 = "INWORLD_VOICE_PRESET_MALE_2",
  INWORLD_VOICE_PRESET_FEMALE_1 = "INWORLD_VOICE_PRESET_FEMALE_1",
  INWORLD_VOICE_PRESET_FEMALE_2 = "INWORLD_VOICE_PRESET_FEMALE_2",
  INWORLD_VOICE_PRESET_MALE_3 = "INWORLD_VOICE_PRESET_MALE_3",
  INWORLD_VOICE_PRESET_MALE_4 = "INWORLD_VOICE_PRESET_MALE_4",
  INWORLD_VOICE_PRESET_MALE_5 = "INWORLD_VOICE_PRESET_MALE_5",
  INWORLD_VOICE_PRESET_FEMALE_3 = "INWORLD_VOICE_PRESET_FEMALE_3",
  INWORLD_VOICE_PRESET_FEMALE_4 = "INWORLD_VOICE_PRESET_FEMALE_4",
  INWORLD_VOICE_PRESET_ROBOT_MALE_1 = "INWORLD_VOICE_PRESET_ROBOT_MALE_1",
  INWORLD_VOICE_PRESET_ROBOT_MALE_2 = "INWORLD_VOICE_PRESET_ROBOT_MALE_2",
  INWORLD_VOICE_PRESET_ROBOT_MALE_3 = "INWORLD_VOICE_PRESET_ROBOT_MALE_3",
  INWORLD_VOICE_PRESET_ROBOT_MALE_4 = "INWORLD_VOICE_PRESET_ROBOT_MALE_4",
  INWORLD_VOICE_PRESET_ROBOT_MALE_5 = "INWORLD_VOICE_PRESET_ROBOT_MALE_5",
  INWORLD_VOICE_PRESET_ROBOT_FEMALE_1 = "INWORLD_VOICE_PRESET_ROBOT_FEMALE_1",
  INWORLD_VOICE_PRESET_ROBOT_FEMALE_2 = "INWORLD_VOICE_PRESET_ROBOT_FEMALE_2",
  INWORLD_VOICE_PRESET_ROBOT_FEMALE_3 = "INWORLD_VOICE_PRESET_ROBOT_FEMALE_3",
  INWORLD_VOICE_PRESET_ROBOT_FEMALE_4 = "INWORLD_VOICE_PRESET_ROBOT_FEMALE_4",
  INWORLD_VOICE_PRESET_SPIKE = "INWORLD_VOICE_PRESET_SPIKE",
  INWORLD_VOICE_PRESET_TWILIGHT = "INWORLD_VOICE_PRESET_TWILIGHT",
  INWORLD_VOICE_PRESET_FLUTTERSHY = "INWORLD_VOICE_PRESET_FLUTTERSHY",
  INWORLD_VOICE_PRESET_ROBOT_SPIKE = "INWORLD_VOICE_PRESET_ROBOT_SPIKE",
  INWORLD_VOICE_PRESET_ROBOT_TWILIGHT = "INWORLD_VOICE_PRESET_ROBOT_TWILIGHT",
  INWORLD_VOICE_PRESET_ROBOT_FLUTTERSHY = "INWORLD_VOICE_PRESET_ROBOT_FLUTTERSHY",
}

export enum PreviousDialogDialogParticipant {
  UNKNOWN = "UNKNOWN",
  PLAYER = "PLAYER",
  CHARACTER = "CHARACTER",
}

export type InteractionFeedback = {
  isLike?: boolean
  type?: InteractionDislikeType[]
  comment?: string
}

export type CreateInteractionFeedbackRequest = {
  parent?: string
  feedback?: InteractionFeedback
}

export type PingCharacterRequest = {
  name?: string
}

export type CapabilitiesRequest = {
  audio?: boolean
  text?: boolean
  gestures?: boolean
  interruptions?: boolean
  triggers?: boolean
  emotions?: boolean
  animations?: boolean
  turnBasedStt?: boolean
  emotionStreaming?: boolean
  silenceEvents?: boolean
  phonemeInfo?: boolean
  continuation?: boolean
  sessionCancellation?: boolean
  narratedActions?: boolean
  regenerateResponse?: boolean
  loadSceneInSession?: boolean
}

export type UserRequest = {
  name?: string
  id?: string
}

export type ClientRequest = {
  id?: string
  version?: string
}

export type CreateWorldRequestCreateAgentRequest = {
  brainName?: string
  languageCode?: string
  voicePreset?: VoicePreset
}

export type CreateWorldRequestClientRequest = {
  id?: string
  version?: string
}

export type CreateWorldRequest = {
  protoWorldName?: string
  createAgentRequests?: CreateWorldRequestCreateAgentRequest[]
  capabilities?: CapabilitiesRequest
  user?: UserRequest
  client?: CreateWorldRequestClientRequest
}

export type CreateWorldResponseAgent = {
  agentId?: string
  brainName?: string
}

export type CreateWorldResponse = {
  agents?: CreateWorldResponseAgent[]
  key?: string
}

export type LoadSceneRequest = {
  name?: string
  capabilities?: CapabilitiesRequest
  user?: UserRequest
  client?: ClientRequest
  audioSettings?: AudioSettings
  userSettings?: UserSettings
  sessionContinuation?: SessionContinuation
}

export type AudioSettings = {
  sttSampleRateHertz?: number
  ttsSampleRateHertz?: number
}

export type UserSettings = {
  viewTranscriptConsent?: boolean
}

export type SessionContinuationContinuationInfo = {
  millisPassed?: string
}

export type SessionContinuation = {
  continuationInfo?: SessionContinuationContinuationInfo
  previousDialog?: PreviousDialog
  previousState?: Uint8Array
}

export type PreviousDialogPhrase = {
  talker?: PreviousDialogDialogParticipant
  phrase?: string
}

export type PreviousDialog = {
  phrases?: PreviousDialogPhrase[]
}

export type PreviousStateStateHolder = {
  brainName?: string
  state?: Uint8Array
  previousDialog?: PreviousDialog
  packets?: AiInworldPacketsPackets.InworldPacket[]
}

export type PreviousState = {
  stateHolders?: PreviousStateStateHolder[]
}

export type LoadSceneResponseAgentCharacterAssets = {
  rpmModelUri?: string
  rpmImageUriPortrait?: string
  rpmImageUriPosture?: string
  avatarImg?: string
  avatarImgOriginal?: string
}

export type LoadSceneResponseAgent = {
  agentId?: string
  brainName?: string
  givenName?: string
  characterAssets?: LoadSceneResponseAgentCharacterAssets
}

export type LoadSceneResponse = {
  agents?: LoadSceneResponseAgent[]
  key?: string
  previousState?: PreviousState
}

export type LogErrorRequest = {
  key?: string
  message?: string
}

export type VoicePreviewRequest = {
  text?: string
  emotions?: AiInworldPacketsPackets.EmotionEvent
  voice?: AiInworldVoicesVoices.Voice
}

export type VoicePreviewResponse = {
  audio?: Uint8Array
}

export type ListBaseVoicesRequest = {
  languageCode?: string
  ttsTypes?: AiInworldVoicesVoices.TTSType[]
}

export type ListBaseVoicesResponceBaseVoice = {
  languageCodes?: string[]
  name?: string
  gender?: AiInworldVoicesVoices.Gender
  naturalSampleRateHertz?: number
}

export type ListBaseVoicesResponce = {
  googleVoices?: ListBaseVoicesResponceBaseVoice[]
  inworldVoices?: ListBaseVoicesResponceBaseVoice[]
}

export type AccessToken = {
  token?: string
  type?: string
  expirationTime?: GoogleProtobufTimestamp.Timestamp
  sessionId?: string
}

export type GenerateTokenRequest = {
  key?: string
}

export class WorldEngine {
  static CreateWorld(req: CreateWorldRequest, initReq?: fm.InitReq): Promise<CreateWorldResponse> {
    return fm.fetchReq<CreateWorldRequest, CreateWorldResponse>(`/v1/worlds/${req["protoWorldName"]}`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static LoadScene(req: LoadSceneRequest, initReq?: fm.InitReq): Promise<LoadSceneResponse> {
    return fm.fetchReq<LoadSceneRequest, LoadSceneResponse>(`/v1/${req["name"]}:load`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static LogError(req: LogErrorRequest, initReq?: fm.InitReq): Promise<GoogleProtobufEmpty.Empty> {
    return fm.fetchReq<LogErrorRequest, GoogleProtobufEmpty.Empty>(`/v1/log:error`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static VoicePreview(req: VoicePreviewRequest, initReq?: fm.InitReq): Promise<VoicePreviewResponse> {
    return fm.fetchReq<VoicePreviewRequest, VoicePreviewResponse>(`/v1/voice:preview`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static ListBaseVoices(req: ListBaseVoicesRequest, initReq?: fm.InitReq): Promise<ListBaseVoicesResponce> {
    return fm.fetchReq<ListBaseVoicesRequest, ListBaseVoicesResponce>(`/v1/voice:base?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"})
  }
  static GenerateToken(req: GenerateTokenRequest, initReq?: fm.InitReq): Promise<AccessToken> {
    return fm.fetchReq<GenerateTokenRequest, AccessToken>(`/auth/v1/tokens/token:generate`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static PingCharacter(req: PingCharacterRequest, initReq?: fm.InitReq): Promise<GoogleProtobufEmpty.Empty> {
    return fm.fetchReq<PingCharacterRequest, GoogleProtobufEmpty.Empty>(`/auth/v1/character:ping`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static CreateInteractionFeedback(req: CreateInteractionFeedbackRequest, initReq?: fm.InitReq): Promise<GoogleProtobufEmpty.Empty> {
    return fm.fetchReq<CreateInteractionFeedbackRequest, GoogleProtobufEmpty.Empty>(`/v1/${req["parentsessiondefaultagentsinteractions"]}/feedback`, {...initReq, method: "POST", body: JSON.stringify(req["feedback"], fm.replacer)})
  }
}