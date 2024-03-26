import {
  Feedback as FeedbackPb,
  InteractionFeedback,
} from '../../../proto/ai/inworld/engine/v1/feedback.pb';
import { SCENE_PATTERN } from '../../common/constants';
import { InternalClientConfiguration } from '../../common/data_structures';
import { Feedback } from '../../entities/feedback.entity';
import { SessionToken } from '../../entities/session_token.entity';
import { PbService } from './pb.service';

export interface CreateInteractionFeedbackProps {
  scene: string;
  correlationId?: string;
  config: InternalClientConfiguration;
  interactionFeedback: InteractionFeedback;
  interactionId: string;
  session: SessionToken;
}

export interface DeletenteractionFeedbackProps {
  config: InternalClientConfiguration;
  session: SessionToken;
  name: string;
}

export class FeedbackService extends PbService {
  async createInteractionFeedback(props: CreateInteractionFeedbackProps) {
    const {
      scene,
      correlationId = 'default',
      config,
      interactionFeedback,
      interactionId,
      session,
    } = props;
    const workspace = SCENE_PATTERN.exec(scene)[1];

    const response = await this.request(
      config,
      session,
      FeedbackPb.CreateInteractionFeedback,
      {
        parent:
          `workspaces/${workspace}/` +
          `sessions/${session.sessionId}/` +
          `interactions/${interactionId}/` +
          `groups/${correlationId}`,
        interactionFeedback,
      },
    );

    return Feedback.fromProto(response);
  }

  async deleteInteractionFeedback(props: DeletenteractionFeedbackProps) {
    const { session, name } = props;

    await this.request(
      props.config,
      session,
      FeedbackPb.DeleteInteractionFeedback,
      {
        name,
      },
    );
  }
}
