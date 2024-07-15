/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/
export type CapabilitiesConfiguration = {
  audio?: boolean
  interruptions?: boolean
  emotions?: boolean
  turnBasedStt?: boolean
  emotionStreaming?: boolean
  silenceEvents?: boolean
  phonemeInfo?: boolean
  continuation?: boolean
  sessionCancellation?: boolean
  narratedActions?: boolean
  regenerateResponse?: boolean
  relations?: boolean
  debugInfo?: boolean
  ttsMp3?: boolean
  multiAgent?: boolean
  audio2Face?: boolean
  inspect?: boolean
  pingPongReport?: boolean
  perceivedLatencyReport?: boolean
  multiModalActionPlanning?: boolean
}

export type UserConfigurationUserSettingsPlayerProfilePlayerField = {
  fieldId?: string
  fieldValue?: string
}

export type UserConfigurationUserSettingsPlayerProfile = {
  fields?: UserConfigurationUserSettingsPlayerProfilePlayerField[]
}

export type UserConfigurationUserSettings = {
  viewTranscriptConsent?: boolean
  playerProfile?: UserConfigurationUserSettingsPlayerProfile
}

export type UserConfiguration = {
  name?: string
  id?: string
  userSettings?: UserConfigurationUserSettings
}

export type ClientConfiguration = {
  id?: string
  version?: string
  description?: string
}

export type SessionConfiguration = {
  gameSessionId?: string
}