import { DislikeType, Feedback } from '../entities/feedback.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { ConnectionService } from './connection.service';
import { FeedbackService as PbService } from './pb/feedback.service';

interface SendFeedbackProps {
  comment?: string;
  isLike?: boolean;
  types?: DislikeType[];
  interactionId: string;
  correlationId?: string;
}

export interface BaseFeedbackProps {
  interactionId: string;
  correlationId?: string;
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
    const session = await this.connection.ensureSessionToken();
    const interactionFeedback = new Feedback({
      isLike: props.isLike,
      types: props.types,
      comment: props.comment,
    }).toProto();

    return this.service.createInteractionFeedback({
      scene: this.connection.getSceneName(),
      config: this.connection.getConfig(),
      correlationId: props.correlationId,
      interactionFeedback,
      interactionId: props.interactionId,
      session,
    });
  }
}
