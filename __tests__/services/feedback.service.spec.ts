import '../mocks/window.mock';

import { v4 } from 'uuid';

import {
  InteractionDislikeType,
  InteractionFeedback,
} from '../../proto/feedback.pb';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { GrpcWebRtcLoopbackBiDiSession } from '../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import { ConnectionService } from '../../src/services/connection.service';
import {
  DislikeType,
  FeedbackService as PbService,
} from '../../src/services/feedback.service';
import { FeedbackService } from '../../src/services/pb/feedback.service';
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
  const characterId = v4();
  const comment = v4();
  const types = [
    DislikeType.IRRELEVANT,
    DislikeType.UNSAFE,
    DislikeType.UNTRUE,
    DislikeType.INCORRECT_USE_KNOWLEDGE,
    DislikeType.UNEXPECTED_ACTION,
    DislikeType.UNEXPECTED_GOAL_BEHAVIOR,
    DislikeType.REPETITION,
    '' as DislikeType,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('like', async () => {
    const interactionFeedback = { isLike: true } as InteractionFeedback;

    const createInteractionFeedback = jest
      .spyOn(FeedbackService.prototype, 'createInteractionFeedback')
      .mockImplementationOnce(() => Promise.resolve());

    await new PbService(connection).like({
      interactionId,
      characterId,
    });

    expect(createInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(createInteractionFeedback).toHaveBeenCalledWith({
      config: undefined,
      session,
      characterId,
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
    };

    const createInteractionFeedback = jest
      .spyOn(FeedbackService.prototype, 'createInteractionFeedback')
      .mockImplementationOnce(() => Promise.resolve());

    await new PbService(connection).dislike({
      interactionId,
      comment,
      types,
    });

    expect(createInteractionFeedback).toHaveBeenCalledTimes(1);
    expect(createInteractionFeedback).toHaveBeenCalledWith({
      config: undefined,
      characterId: character.id,
      interactionId,
      interactionFeedback,
      session,
    });
  });
});
