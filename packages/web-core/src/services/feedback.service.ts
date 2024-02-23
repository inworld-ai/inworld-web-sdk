import { DislikeType, Feedback } from '../entities/feedback.entity';
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

  async undo(name: string) {
    const session = await this.connection.ensureSessionToken();

    return this.service.deleteInteractionFeedback({
      config: this.connection.getConfig(),
      name,
      session,
    });
  }

  private async send(props: SendFeedbackProps) {
    const characterId =
      props.characterId ?? (await this.connection.getCurrentCharacter())?.id;

    if (!characterId) {
      throw new Error('characterId is required to send feedback');
    }

    const session = await this.connection.ensureSessionToken();
    const interactionFeedback = new Feedback({
      isLike: props.isLike,
      types: props.types,
      comment: props.comment,
    }).toProto();

    return this.service.createInteractionFeedback({
      config: this.connection.getConfig(),
      characterId,
      interactionFeedback,
      interactionId: props.interactionId,
      session,
    });
  }
}
