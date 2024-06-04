/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "../../../../fetch.pb"
import * as GoogleProtobufTimestamp from "../../../../google/protobuf/timestamp.pb"
export type GetSessionStateRequest = {
  name?: string
}

export type SessionStateVersion = {
  interactionId?: string
}

export type SessionState = {
  state?: Uint8Array
  creationTime?: GoogleProtobufTimestamp.Timestamp
  version?: SessionStateVersion
}

export class StateSerialization {
  static GetSessionState(req: GetSessionStateRequest, initReq?: fm.InitReq): Promise<SessionState> {
    return fm.fetchReq<GetSessionStateRequest, SessionState>(`/v1/${req["name"]}/state?${fm.renderURLSearchParams(req, ["name"])}`, {...initReq, method: "GET"})
  }
}