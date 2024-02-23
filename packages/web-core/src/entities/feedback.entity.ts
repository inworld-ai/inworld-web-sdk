import {
  InteractionDislikeType,
  InteractionFeedback,
} from '../../proto/ai/inworld/engine/v1/feedback.pb';

export interface FeedbackProps {
  isLike?: boolean;
  types?: DislikeType[];
  comment?: string;
  name?: string;
}

export enum DislikeType {
  IRRELEVANT = 'IRRELEVANT',
  UNSAFE = 'UNSAFE',
  UNTRUE = 'UNTRUE',
  INCORRECT_USE_KNOWLEDGE = 'INCORRECT_USE_KNOWLEDGE',
  UNEXPECTED_ACTION = 'UNEXPECTED_ACTION',
  UNEXPECTED_GOAL_BEHAVIOR = 'UNEXPECTED_GOAL_BEHAVIOR',
  REPETITION = 'REPETITION',
  UNSPECIFIED = 'UNSPECIFIED',
}

export class Feedback {
  readonly isLike: boolean;
  readonly types: DislikeType[];
  readonly comment: string | undefined;
  readonly name: string | undefined;

  constructor(props?: FeedbackProps) {
    this.isLike = props?.isLike ?? false;
    this.types = props?.types ?? [];
    this.comment = props?.comment;
    this.name = props?.name;
  }

  static fromProto(proto: InteractionFeedback) {
    const feedback = new Feedback({
      isLike: proto.isLike,
      types: proto.type.map((type) => Feedback.convertTypeFromProto(type)),
      comment: proto.comment,
      name: proto.name,
    });

    return feedback;
  }

  toProto() {
    return {
      isLike: this.isLike,
      ...(this.types.length && {
        type: this.types.map((type) => Feedback.convertTypeToProto(type)),
      }),
      ...(this.comment && { comment: this.comment }),
      ...(this.name && { name: this.name }),
    } as InteractionFeedback;
  }

  private static convertTypeToProto(type: DislikeType) {
    switch (type) {
      case DislikeType.IRRELEVANT:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_IRRELEVANT;
      case DislikeType.UNSAFE:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNSAFE;
      case DislikeType.UNTRUE:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNTRUE;
      case DislikeType.INCORRECT_USE_KNOWLEDGE:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE;
      case DislikeType.UNEXPECTED_ACTION:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNEXPECTED_ACTION;
      case DislikeType.UNEXPECTED_GOAL_BEHAVIOR:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR;
      case DislikeType.REPETITION:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_REPETITION;
      default:
        return InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNSPECIFIED;
    }
  }

  private static convertTypeFromProto(type: InteractionDislikeType) {
    switch (type) {
      case InteractionDislikeType.INTERACTION_DISLIKE_TYPE_IRRELEVANT:
        return DislikeType.IRRELEVANT;
      case InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNSAFE:
        return DislikeType.UNSAFE;
      case InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNTRUE:
        return DislikeType.UNTRUE;
      case InteractionDislikeType.INTERACTION_DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE:
        return DislikeType.INCORRECT_USE_KNOWLEDGE;
      case InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNEXPECTED_ACTION:
        return DislikeType.UNEXPECTED_ACTION;
      case InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR:
        return DislikeType.UNEXPECTED_GOAL_BEHAVIOR;
      case InteractionDislikeType.INTERACTION_DISLIKE_TYPE_REPETITION:
        return DislikeType.REPETITION;
      default:
        return DislikeType.UNSPECIFIED;
    }
  }
}
