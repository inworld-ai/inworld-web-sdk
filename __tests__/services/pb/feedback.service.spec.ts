import { v4 } from 'uuid';

import {
  CreateInteractionFeedbackRequest,
  Feedback,
  InteractionDislikeType,
  InteractionFeedback,
} from '../../../proto/feedback.pb';
import * as fm from '../../../proto/fetch.pb';
import { CapabilitiesRequest } from '../../../proto/world-engine.pb';
import { FeedbackService } from '../../../src/services/pb/feedback.service';
import { session } from '../../helpers';

describe('createInteractionFeedback', () => {
  let service: FeedbackService;
  const capabilities: CapabilitiesRequest = {
    emotions: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeedbackService();
  });

  test('should run without errors', async () => {
    const empty = {};
    const interactionId = v4();
    const characterId = v4();
    const comment = v4();
    const interactionFeedback = {
      comment,
      isLike: true,
      types: [
        InteractionDislikeType.INTERACTION_DISLIKE_TYPE_IRRELEVANT,
        InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNSAFE,
      ],
    } as InteractionFeedback;
    const CreateInteractionFeedback = jest.fn(
      (_req: CreateInteractionFeedbackRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve(empty);
      },
    );

    Feedback.CreateInteractionFeedback = CreateInteractionFeedback;

    const result = await service.createInteractionFeedback({
      session,
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      characterId,
      interactionId,
      interactionFeedback,
    });

    expect(CreateInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(result).toEqual(empty);
  });
});
