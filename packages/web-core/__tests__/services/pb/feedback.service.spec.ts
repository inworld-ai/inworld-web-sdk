import { v4 } from 'uuid';

import {
  CreateInteractionFeedbackRequest,
  DeleteInteractionFeedbackRequest,
  Feedback,
  InteractionDislikeType,
  InteractionFeedback,
} from '../../../proto/ai/inworld/engine/v1/feedback.pb';
import { CapabilitiesRequest } from '../../../proto/ai/inworld/engine/world-engine.pb';
import * as fm from '../../../proto/fetch.pb';
import { FeedbackService } from '../../../src/services/pb/feedback.service';
import { session } from '../../helpers';

const capabilities: CapabilitiesRequest = {
  emotions: true,
};

describe('createInteractionFeedback', () => {
  let service: FeedbackService;

  beforeEach(() => {
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
    const createInteractionFeedback = jest.fn(
      (_req: CreateInteractionFeedbackRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve(empty);
      },
    );

    Feedback.CreateInteractionFeedback = createInteractionFeedback;

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

    expect(createInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(result).toEqual(empty);
  });
});

describe('deleteInteractionFeedback', () => {
  let service: FeedbackService;

  beforeEach(() => {
    service = new FeedbackService();
  });

  test('should run without errors', async () => {
    const empty = {};
    const name = v4();

    const deleteInteractionFeedback = jest.fn(
      (_req: DeleteInteractionFeedbackRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve(empty);
      },
    );

    Feedback.DeleteInteractionFeedback = deleteInteractionFeedback;

    const result = await service.deleteInteractionFeedback({
      session,
      config: {
        capabilities,
        connection: {
          gateway: { hostname: 'examples.com', ssl: true },
        },
      },
      name,
    });

    expect(deleteInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(result).toEqual(empty);
  });
});
