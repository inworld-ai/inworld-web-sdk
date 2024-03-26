import '../mocks/window.mock';

import { v4 } from 'uuid';

import {
  InteractionDislikeType,
  InteractionFeedback,
} from '../../proto/ai/inworld/engine/v1/feedback.pb';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { GrpcWebRtcLoopbackBiDiSession } from '../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import { DislikeType, Feedback } from '../../src/entities/feedback.entity';
import { ConnectionService } from '../../src/services/connection.service';
import { FeedbackService } from '../../src/services/feedback.service';
import { FeedbackService as FeedbackPbService } from '../../src/services/pb/feedback.service';
import {
  createCharacter,
  generateSessionToken,
  SCENE,
  session,
} from '../helpers';

const grpcAudioPlayer = new GrpcAudioPlayback();
const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();

describe('should create interaction feedback', () => {
  const interactionId = v4();
  const correlationId = v4();
  const comment = v4();
  const types = [
    DislikeType.IRRELEVANT,
    DislikeType.UNSAFE,
    DislikeType.UNTRUE,
    DislikeType.INCORRECT_USE_KNOWLEDGE,
    DislikeType.UNEXPECTED_ACTION,
    DislikeType.UNEXPECTED_GOAL_BEHAVIOR,
    DislikeType.REPETITION,
    DislikeType.UNSPECIFIED,
  ];
  const protoTypes = [
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_IRRELEVANT,
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNSAFE,
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNTRUE,
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_INCORRECT_USE_KNOWLEDGE,
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNEXPECTED_ACTION,
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNEXPECTED_GOAL_BEHAVIOR,
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_REPETITION,
    InteractionDislikeType.INTERACTION_DISLIKE_TYPE_UNSPECIFIED,
  ];
  const connection = new ConnectionService({
    name: SCENE,
    grpcAudioPlayer,
    webRtcLoopbackBiDiSession,
    generateSessionToken,
  });

  test('like', async () => {
    const interactionFeedback = { isLike: true } as InteractionFeedback;

    const createInteractionFeedback = jest
      .spyOn(FeedbackPbService.prototype, 'createInteractionFeedback')
      .mockImplementationOnce(() => Promise.resolve(new Feedback()));

    await new FeedbackService(connection).like({
      interactionId,
      correlationId,
    });

    expect(createInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(createInteractionFeedback).toHaveBeenCalledWith({
      session,
      scene: SCENE,
      config: undefined,
      correlationId,
      interactionId,
      interactionFeedback,
    });
  });

  test('dislike', async () => {
    const character = createCharacter();

    jest
      .spyOn(connection, 'getCurrentCharacter')
      .mockImplementationOnce(() => Promise.resolve(character));
    const interactionFeedback = {
      isLike: false,
      type: protoTypes,
      comment,
    } as InteractionFeedback;

    const createInteractionFeedback = jest
      .spyOn(FeedbackPbService.prototype, 'createInteractionFeedback')
      .mockImplementationOnce(() => Promise.resolve(new Feedback()));

    await new FeedbackService(connection).dislike({
      interactionId,
      correlationId,
      types,
      comment,
    });

    expect(createInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(createInteractionFeedback).toHaveBeenCalledWith({
      session,
      scene: SCENE,
      config: undefined,
      correlationId,
      interactionId,
      interactionFeedback,
    });
  });

  test('delete', async () => {
    const name = v4();
    const deleteInteractionFeedback = jest
      .spyOn(FeedbackPbService.prototype, 'deleteInteractionFeedback')
      .mockImplementationOnce(() => Promise.resolve());

    await new FeedbackService(connection).undo(name);

    expect(deleteInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(deleteInteractionFeedback).toHaveBeenCalledWith({
      session,
      name,
      config: undefined,
    });
  });
});
