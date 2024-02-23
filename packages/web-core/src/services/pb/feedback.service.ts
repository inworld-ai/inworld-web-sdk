import {
  Feedback,
  InteractionFeedback,
} from '../../../proto/ai/inworld/engine/v1/feedback.pb';
import { InternalClientConfiguration } from '../../common/data_structures';
import { SessionToken } from '../../entities/session_token.entity';
import { PbService } from './pb.service';

export interface CreateInteractionFeedbackProps {
  characterId: string;
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
    const { characterId, config, interactionFeedback, interactionId, session } =
      props;

    return this.request(config, session, Feedback.CreateInteractionFeedback, {
      parent: `session/default/agents/${characterId}/interactions/${interactionId}`,
      interactionFeedback,
    });
  }

  async deleteInteractionFeedback(props: DeletenteractionFeedbackProps) {
    const { session, name } = props;

    return this.request(
      props.config,
      session,
      Feedback.DeleteInteractionFeedback,
      {
        name,
      },
    );
  }
}
