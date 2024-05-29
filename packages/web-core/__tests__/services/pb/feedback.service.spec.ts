import { v4 } from 'uuid';

import {
  CreateInteractionFeedbackRequest,
  DeleteInteractionFeedbackRequest,
  Feedback as FeedbackPb,
  InteractionDislikeType,
  InteractionFeedback,
} from '../../../proto/ai/inworld/engine/v1/feedback.pb';
import { CapabilitiesRequest } from '../../../proto/ai/inworld/engine/world-engine.pb';
import * as fm from '../../../proto/fetch.pb';
import { SCENE_PATTERN } from '../../../src/common/constants';
import { Feedback } from '../../../src/entities/feedback.entity';
import { FeedbackService } from '../../../src/services/pb/feedback.service';
import { SCENE, session } from '../../helpers';

const capabilities: CapabilitiesRequest = {
  emotions: true,
};

const createFeedback = async (props: {
  service: FeedbackService;
  interactionId: string;
  interactionFeedback: InteractionFeedback;
  correlationId?: string;
}) =>
  props.service.createInteractionFeedback({
    session,
    config: {
      capabilities,
      connection: {
        gateway: { hostname: 'examples.com', ssl: true },
      },
    },
    scene: SCENE,
    correlationId: props.correlationId,
    interactionId: props.interactionId,
    interactionFeedback: props.interactionFeedback,
  });

describe('createInteractionFeedback', () => {
  let service: FeedbackService;
  let interactionId: string;
  let correlationId: string;
  let comment: string;
  let workspace: string;
  let interactionFeedback: InteractionFeedback;

  beforeEach(() => {
    service = new FeedbackService();
    interactionId = v4();
    correlationId = v4();
    comment = v4();
    workspace = SCENE_PATTERN.exec(SCENE)[1];
    interactionFeedback = {
      comment,
      isLike: true,
      type: [
        InteractionDislikeType.INTERACTION_DISLIKE_TYPE_IRRELEVANT,
        InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNSAFE,
      ],
    };
  });

  test('should work with correlationId', async () => {
    const expectedResult = { type: [] } as InteractionFeedback;
    const createInteractionFeedback = jest.fn(
      (_req: CreateInteractionFeedbackRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve(expectedResult);
      },
    );

    FeedbackPb.CreateInteractionFeedback = createInteractionFeedback;

    const result = await createFeedback({
      service,
      interactionId,
      interactionFeedback,
      correlationId,
    });

    expect(createInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(createInteractionFeedback.mock.calls[0][0].parent).toEqual(
      `workspaces/${workspace}/sessions/${session.sessionId}/interactions/${interactionId}/groups/${correlationId}`,
    );
    expect(result).toEqual(Feedback.fromProto(expectedResult));
  });

  test('should work without correlationId', async () => {
    const expectedResult = { type: [] } as InteractionFeedback;
    const createInteractionFeedback = jest.fn(
      (_req: CreateInteractionFeedbackRequest, _initReq?: fm.InitReq) => {
        expect(_initReq.pathPrefix).toEqual('https://examples.com');
        return Promise.resolve(expectedResult);
      },
    );

    FeedbackPb.CreateInteractionFeedback = createInteractionFeedback;

    const result = await createFeedback({
      service,
      interactionId,
      interactionFeedback,
    });

    expect(createInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(createInteractionFeedback.mock.calls[0][0].parent).toEqual(
      `workspaces/${workspace}/sessions/${session.sessionId}/interactions/${interactionId}/groups/default`,
    );
    expect(result).toEqual(Feedback.fromProto(expectedResult));
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

    FeedbackPb.DeleteInteractionFeedback = deleteInteractionFeedback;

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
    expect(result).toEqual(undefined);
  });
});
