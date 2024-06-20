/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "../../../../fetch.pb"
import * as GoogleProtobufEmpty from "../../../../google/protobuf/empty.pb"

export enum InteractionDislikeType {
  INTERACTION_DISLIKE_TYPE_UNSPECIFIED = "INTERACTION_DISLIKE_TYPE_UNSPECIFIED",
  INTERACTION_DISLIKE_TYPE_IRRELEVANT = "INTERACTION_DISLIKE_TYPE_IRRELEVANT",
  INTERACTION_DISLIKE_TYPE_UNSAFE = "INTERACTION_DISLIKE_TYPE_UNSAFE",
  INTERACTION_DISLIKE_TYPE_UNTRUE = "INTERACTION_DISLIKE_TYPE_UNTRUE",
  INTERACTION_DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE = "INTERACTION_DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE",
  INTERACTION_DISLIKE_TYPE_UNEXPECTED_ACTION = "INTERACTION_DISLIKE_TYPE_UNEXPECTED_ACTION",
  INTERACTION_DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR = "INTERACTION_DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR",
  INTERACTION_DISLIKE_TYPE_REPETITION = "INTERACTION_DISLIKE_TYPE_REPETITION",
  INTERACTION_DISLIKE_TYPE_OUT_OF_CHARACTER = "INTERACTION_DISLIKE_TYPE_OUT_OF_CHARACTER",
  INTERACTION_DISLIKE_TYPE_TOO_LONG = "INTERACTION_DISLIKE_TYPE_TOO_LONG",
}

export type InteractionFeedback = {
  isLike?: boolean
  type?: InteractionDislikeType[]
  comment?: string
  name?: string
}

export type CreateInteractionFeedbackRequest = {
  parent?: string
  interactionFeedback?: InteractionFeedback
}

export type DeleteInteractionFeedbackRequest = {
  name?: string
}

export class Feedback {
  static CreateInteractionFeedback(req: CreateInteractionFeedbackRequest, initReq?: fm.InitReq): Promise<InteractionFeedback> {
    return fm.fetchReq<CreateInteractionFeedbackRequest, InteractionFeedback>(`/v1/feedback/${req["parent"]}/feedbacks`, {...initReq, method: "POST", body: JSON.stringify(req["interactionFeedback"], fm.replacer)})
  }
  static DeleteInteractionFeedback(req: DeleteInteractionFeedbackRequest, initReq?: fm.InitReq): Promise<GoogleProtobufEmpty.Empty> {
    return fm.fetchReq<DeleteInteractionFeedbackRequest, GoogleProtobufEmpty.Empty>(`/v1/feedback/${req["name"]}`, {...initReq, method: "DELETE"})
  }
}