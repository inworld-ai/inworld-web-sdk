/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as GoogleProtobufTimestamp from "../../../google/protobuf/timestamp.pb"

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };
type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (
    keyof T extends infer K ?
      (K extends string & keyof T ? { [k in K]: T[K] } & Absent<T, K>
        : never)
    : never);

export enum ErrorType {
  SESSION_TOKEN_EXPIRED = "SESSION_TOKEN_EXPIRED",
  SESSION_TOKEN_INVALID = "SESSION_TOKEN_INVALID",
  SESSION_RESOURCES_EXHAUSTED = "SESSION_RESOURCES_EXHAUSTED",
  BILLING_TOKENS_EXHAUSTED = "BILLING_TOKENS_EXHAUSTED",
  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",
  SESSION_INVALID = "SESSION_INVALID",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  SAFETY_VIOLATION = "SAFETY_VIOLATION",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  AUDIO_SESSION_EXPIRED = "AUDIO_SESSION_EXPIRED",
  SESSION_PAUSED = "SESSION_PAUSED",
  VERSION_CONFLICT = "VERSION_CONFLICT",
}

export enum ReconnectionType {
  UNDEFINED = "UNDEFINED",
  NO_RETRY = "NO_RETRY",
  IMMEDIATE = "IMMEDIATE",
  TIMEOUT = "TIMEOUT",
}

export enum ResourceType {
  RESOURCE_TYPE_UNDEFINED = "RESOURCE_TYPE_UNDEFINED",
  RESOURCE_TYPE_CONVERSATION = "RESOURCE_TYPE_CONVERSATION",
}


type BaseInworldStatus = {
  errorType?: ErrorType
  reconnectType?: ReconnectionType
  reconnectTime?: GoogleProtobufTimestamp.Timestamp
  maxRetries?: number
}

export type InworldStatus = BaseInworldStatus
  & OneOf<{ resourceNotFound: ResourceNotFoundDetails }>

export type ResourceNotFoundDetails = {
  resourceId?: string
  resourceType?: ResourceType
}