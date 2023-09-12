/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "./fetch.pb"
import * as GoogleProtobufEmpty from "./google/protobuf/empty.pb"

export enum InteractionDislikeType {
  INTERACTION_DISLIKE_TYPE_UNSPECIFIED = "INTERACTION_DISLIKE_TYPE_UNSPECIFIED",
  INTERACTION_DISLIKE_TYPE_IRRELEVANT = "INTERACTION_DISLIKE_TYPE_IRRELEVANT",
  INTERACTION_DISLIKE_TYPE_UNSAFE = "INTERACTION_DISLIKE_TYPE_UNSAFE",
  INTERACTION_DISLIKE_TYPE_UNTRUE = "INTERACTION_DISLIKE_TYPE_UNTRUE",
  INTERACTION_DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE = "INTERACTION_DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE",
  INTERACTION_DISLIKE_TYPE_UNEXPECTED_ACTION = "INTERACTION_DISLIKE_TYPE_UNEXPECTED_ACTION",
  INTERACTION_DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR = "INTERACTION_DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR",
  INTERACTION_DISLIKE_TYPE_REPETITION = "INTERACTION_DISLIKE_TYPE_REPETITION",
}

export type InteractionFeedback = {
  isLike?: boolean
  type?: InteractionDislikeType[]
  comment?: string
  responseId?: string
}

export type CreateInteractionFeedbackRequest = {
  parent?: string
  interactionFeedback?: InteractionFeedback
}

export class Feedback {
  static CreateInteractionFeedback(req: CreateInteractionFeedbackRequest, initReq?: fm.InitReq): Promise<GoogleProtobufEmpty.Empty> {
    return fm.fetchReq<CreateInteractionFeedbackRequest, GoogleProtobufEmpty.Empty>(`/v1/${req["parent"]}/feedback`, {...initReq, method: "POST", body: JSON.stringify(req["interactionFeedback"], fm.replacer)})
  }
}