/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "../../../../fetch.pb"
import * as GoogleProtobufTimestamp from "../../../../google/protobuf/timestamp.pb"
export type SessionAccessToken = {
  token?: string
  type?: string
  expirationTime?: GoogleProtobufTimestamp.Timestamp
  sessionId?: string
}

export type GenerateSessionTokenRequest = {
  key?: string
}

export type GenerateDefaultSessionTokenRequest = {
  parent?: string
}

export class Tokens {
  static GenerateSessionToken(req: GenerateSessionTokenRequest, initReq?: fm.InitReq): Promise<SessionAccessToken> {
    return fm.fetchReq<GenerateSessionTokenRequest, SessionAccessToken>(`/v1alpha/tokens/sessionToken:generate`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static GenerateDefaultSessionToken(req: GenerateDefaultSessionTokenRequest, initReq?: fm.InitReq): Promise<SessionAccessToken> {
    return fm.fetchReq<GenerateDefaultSessionTokenRequest, SessionAccessToken>(`/v1alpha/${req["parentworkspaces"]}/token:generate`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
}