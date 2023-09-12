import { Feedback, InteractionFeedback } from '../../../proto/feedback.pb';
import {
  InternalClientConfiguration,
  SessionToken,
} from '../../common/data_structures';
import { PbService } from './pb.service';

export interface createInteractionFeedbackProps {
  characterId: string;
  config: InternalClientConfiguration;
  interactionFeedback: InteractionFeedback;
  interactionId: string;
  session: SessionToken;
}

export class FeedbackService extends PbService {
  public async createInteractionFeedback(
    props: createInteractionFeedbackProps,
  ) {
    const { characterId, config, interactionFeedback, interactionId, session } =
      props;

    return this.request(config, session, Feedback.CreateInteractionFeedback, {
      parent: `session/default/agents/${characterId}/interactions/${interactionId}`,
      interactionFeedback,
    });
  }
}
