import {
  InteractionDislikeType,
  InteractionFeedback,
} from '../../proto/feedback.pb';
import { InworldPacket } from '../entities/inworld_packet.entity';
import { ConnectionService } from './connection.service';
import { FeedbackService as PbService } from './pb/feedback.service';

interface SendFeedbackProps {
  comment?: string;
  isLike?: boolean;
  types?: DislikeType[];
  interactionId: string;
  characterId?: string;
}

export interface BaseFeedbackProps {
  interactionId: string;
  characterId?: string;
}

export interface FeedbackLikeProps extends BaseFeedbackProps {}

export interface FeedbackDislikeProps extends BaseFeedbackProps {
  comment?: string;
  types?: DislikeType[];
}

export enum DislikeType {
  IRRELEVANT = 'IRRELEVANT',
  UNSAFE = 'UNSAFE',
  UNTRUE = 'UNTRUE',
  INCORRECT_USE_KNOWLEDGE = 'INCORRECT_USE_KNOWLEDGE',
  UNEXPECTED_ACTION = 'UNEXPECTED_ACTION',
  UNEXPECTED_GOAL_BEHAVIOR = 'UNEXPECTED_GOAL_BEHAVIOR',
  REPETITION = 'REPETITION',
}

export class FeedbackService<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private connection: ConnectionService<InworldPacketT>;
  private service = new PbService();

  constructor(connection: ConnectionService<InworldPacketT>) {
    this.connection = connection;
  }

  async like(props: FeedbackLikeProps) {
    return this.send({ ...props, isLike: true });
  }

  async dislike(props: FeedbackDislikeProps) {
    return this.send({ ...props, isLike: false });
  }

  private async send(props: SendFeedbackProps) {
    const characterId =
      props.characterId ?? (await this.connection.getCurrentCharacter()).id;
    const sessionToken = await this.connection.getSessionToken();
    const interactionFeedback = {
      ...(props.isLike
        ? { isLike: true }
        : {
            isLike: false,
            type: (props.types ?? []).map(FeedbackService.convertType),
            ...(props.comment && { comment: props.comment }),
          }),
    } as InteractionFeedback;

    return this.service.createInteractionFeedback({
      config: this.connection.getConfig(),
      characterId,
      interactionFeedback,
      interactionId: props.interactionId,
      session: sessionToken,
    });
  }

  private static convertType(type: string) {
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
}