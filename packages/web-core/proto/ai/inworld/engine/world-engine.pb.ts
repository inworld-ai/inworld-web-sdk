/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "../../../fetch.pb"
import * as GoogleProtobufEmpty from "../../../google/protobuf/empty.pb"
import * as GoogleProtobufTimestamp from "../../../google/protobuf/timestamp.pb"
import * as AiInworldLanguage_codesLanguage_codes from "../language_codes/language_codes.pb"
import * as AiInworldPacketsPackets from "../packets/packets.pb"
import * as AiInworldVoicesBase_voice from "../voices/base_voice.pb"
import * as AiInworldVoicesVoices from "../voices/voices.pb"

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };
type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (
    keyof T extends infer K ?
      (K extends string & keyof T ? { [k in K]: T[K] } & Absent<T, K>
        : never)
    : never);

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
  WORLD = "WORLD",
}

export enum PreviousStateStateHolderStateFormat {
  STATE_FORMAT_UNKNOWN = "STATE_FORMAT_UNKNOWN",
  STATE_FORMAT_SESSION_BRAIN_STATE = "STATE_FORMAT_SESSION_BRAIN_STATE",
  STATE_FORMAT_EXTERNAL_BRAIN_STATE = "STATE_FORMAT_EXTERNAL_BRAIN_STATE",
}

export type CapabilitiesRequest = {
  audio?: boolean
  text?: boolean
  gestures?: boolean
  interruptions?: boolean
  triggers?: boolean
  emotions?: boolean
  turnBasedStt?: boolean
  emotionStreaming?: boolean
  silenceEvents?: boolean
  phonemeInfo?: boolean
  continuation?: boolean
  sessionCancellation?: boolean
  narratedActions?: boolean
  regenerateResponse?: boolean
  loadSceneInSession?: boolean
  relations?: boolean
  debugInfo?: boolean
  ttsMp3?: boolean
  multiAgent?: boolean
  audio2Face?: boolean
  inspect?: boolean
  multiModalActionPlanning?: boolean
  pingPongReport?: boolean
  perceivedLatencyReport?: boolean
}

export type UserRequest = {
  name?: string
  id?: string
}

export type ClientRequest = {
  id?: string
  version?: string
  description?: string
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

export type UserSettingsPlayerProfilePlayerField = {
  fieldId?: string
  fieldValue?: string
}

export type UserSettingsPlayerProfile = {
  fields?: UserSettingsPlayerProfilePlayerField[]
}

export type UserSettings = {
  viewTranscriptConsent?: boolean
  playerProfile?: UserSettingsPlayerProfile
}

export type SessionContinuationContinuationInfo = {
  millisPassed?: string
}

export type SessionContinuation = {
  continuationInfo?: SessionContinuationContinuationInfo
  previousDialog?: PreviousDialog
  previousState?: Uint8Array
}


type BasePreviousDialogPhrase = {
  talker?: PreviousDialogDialogParticipant
  talkerDisplayName?: string
}

export type PreviousDialogPhrase = BasePreviousDialogPhrase
  & OneOf<{ phrase: string; narrativeAction: string }>

export type PreviousDialog = {
  phrases?: PreviousDialogPhrase[]
}

export type PreviousStateStateHolder = {
  brainName?: string
  state?: Uint8Array
  previousDialog?: PreviousDialog
  packets?: AiInworldPacketsPackets.InworldPacket[]
  relationsToActors?: ActorRelations[]
  stateFormat?: PreviousStateStateHolderStateFormat
}

export type PreviousStateEntitiesStateEntityItem = {
  id?: string
  displayName?: string
  description?: string
  properties?: {[key: string]: string}
  entities?: string[]
}

export type PreviousStateEntitiesStateEntity = {
  id?: string
  displayName?: string
  description?: string
}

export type PreviousStateEntitiesState = {
  entityItems?: PreviousStateEntitiesStateEntityItem[]
  entities?: PreviousStateEntitiesStateEntity[]
}

export type PreviousState = {
  stateHolders?: PreviousStateStateHolder[]
  gameSessionId?: string
  conversationState?: ConversationState
  entitiesState?: PreviousStateEntitiesState
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
  language?: AiInworldLanguage_codesLanguage_codes.LanguageCode
}

export type ListBaseVoicesResponce = {
  googleVoices?: AiInworldVoicesBase_voice.BaseVoice[]
  inworldVoices?: AiInworldVoicesBase_voice.BaseVoice[]
  elevenLabsVoices?: AiInworldVoicesBase_voice.BaseVoice[]
  inworldV2Voices?: AiInworldVoicesBase_voice.BaseVoice[]
}

export type AccessToken = {
  token?: string
  type?: string
  expirationTime?: GoogleProtobufTimestamp.Timestamp
  sessionId?: string
}

export type GenerateTokenRequest = {
  key?: string
  resources?: string[]
}

export type ActorRelationsRelation = {
  type?: string
  label?: string
}

export type ActorRelations = {
  actorId?: string
  relations?: ActorRelationsRelation[]
}

export type ConversationStateConversationSettings = {
  conversationId?: string
  participants?: string[]
  spectators?: string[]
  participatingActors?: AiInworldPacketsPackets.Actor[]
}

export type ConversationState = {
  conversationSettings?: ConversationStateConversationSettings[]
}

export class WorldEngine {
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
}