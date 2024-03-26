import { v4 } from 'uuid';

import {
  Actor,
  ActorType,
  ContinuationContinuationType,
  ControlEventAction,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
} from '../../proto/ai/inworld/packets/packets.pb';
import { protoTimestamp } from '../../src/common/helpers';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { EventFactory } from '../../src/factories/event';
import { capabilitiesProps, createCharacter } from '../helpers';

let factory: EventFactory;

beforeEach(() => {
  factory = new EventFactory();
});

test('should set and get character', () => {
  const character = createCharacter();

  factory.setCurrentCharacter(character);

  const found = factory.getCurrentCharacter();

  expect(found).toEqual(character);
  expect(found?.id).toEqual(character.id);
});

describe('event types', () => {
  const character = createCharacter();

  beforeEach(() => {
    factory.setCurrentCharacter(character);
  });

  test('should generate audio event', () => {
    const chunk = v4();
    const event = factory.dataChunk(chunk, DataChunkDataType.AUDIO);

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.dataChunk).toEqual({
      chunk,
      type: DataChunkDataType.AUDIO,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate audio session start', () => {
    const event = factory.audioSessionStart();

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.AUDIO_SESSION_START,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate audio session end', () => {
    const event = factory.audioSessionEnd();

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.AUDIO_SESSION_END,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate tts playback start', () => {
    const event = factory.ttsPlaybackStart();

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.TTS_PLAYBACK_START,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate tts playback end', () => {
    const event = factory.ttsPlaybackEnd();

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.TTS_PLAYBACK_END,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate tts playback mute', () => {
    const event = factory.ttsPlaybackMute(true);

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.TTS_PLAYBACK_MUTE,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate tts playback unmute', () => {
    const event = factory.ttsPlaybackMute(false);

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.TTS_PLAYBACK_UNMUTE,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate text event', () => {
    const text = v4();
    const event = factory.text(text);

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.text.text).toEqual(text);
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
  });

  test('should generate trigger event without parameters', () => {
    const name = v4();
    const event = factory.trigger(name);

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.custom.name).toEqual(name);
    expect(event.custom.parameters).toEqual(undefined);
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
  });

  test('should generate trigger event with parameters', () => {
    const name = v4();
    const parameters = [{ name: v4(), value: v4() }];
    const event = factory.trigger(name, { parameters });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.custom.name).toEqual(name);
    expect(event.custom.parameters).toEqual(parameters);
    expect(event.routing.target.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
  });

  test('should generate cancel response event', () => {
    const interactionId = v4();
    const utteranceId = [v4()];
    const event = factory.cancelResponse({ interactionId, utteranceId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.mutation.cancelResponses).toEqual({
      interactionId,
      utteranceId,
    });
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId).toHaveProperty('correlationId');
  });

  test('should generate narrated action event', () => {
    const text = v4();
    const event = factory.narratedAction(text);

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.action?.narratedAction?.content).toEqual(text);
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
  });

  test('should generate session control capabilities', () => {
    const event = EventFactory.sessionControl({
      capabilities: capabilitiesProps,
    });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.capabilitiesConfiguration).toEqual(
      capabilitiesProps,
    );
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control session configuration', () => {
    const sessionConfiguration = { gameSessionId: v4() };
    const event = EventFactory.sessionControl({ sessionConfiguration });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.sessionConfiguration).toEqual(
      sessionConfiguration,
    );
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control client configuration', () => {
    const clientConfiguration = {
      id: v4(),
      version: v4(),
      description: v4(),
    };
    const event = EventFactory.sessionControl({ clientConfiguration });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.clientConfiguration).toEqual(
      clientConfiguration,
    );
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control user configuration', () => {
    const userConfiguration = {
      id: v4(),
      fullName: v4(),
      profile: { fields: [{ id: v4(), value: v4() }] },
    };
    const event = EventFactory.sessionControl({ userConfiguration });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.userConfiguration).toEqual(userConfiguration);
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control previous history', () => {
    const continuation = {
      dialogHistory: {
        history: [
          {
            actor: { name: v4(), type: ActorType.AGENT },
            text: v4(),
          },
        ],
      },
      continuationType:
        ContinuationContinuationType.CONTINUATION_TYPE_DIALOG_HISTORY,
    };
    const event = EventFactory.sessionControl({ continuation });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.continuation).toEqual(continuation);
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control previous state', () => {
    const continuation = {
      externallySavedState: v4() as unknown as Uint8Array,
      continuationType:
        ContinuationContinuationType.CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE,
    };
    const event = EventFactory.sessionControl({ continuation });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.continuation).toEqual(continuation);
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control history', () => {
    const sessionHistory = {};
    const event = EventFactory.sessionControl({ sessionHistory });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.sessionHistoryRequest).toEqual(sessionHistory);
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });
});

describe('convert packet to external one', () => {
  const character = createCharacter();

  beforeEach(() => {
    factory.setCurrentCharacter(character);
  });

  test('audio', () => {
    const packet: ProtoPacket = {
      packetId: { packetId: v4() },
      routing: {
        source: {} as Actor,
        targets: [{} as Actor],
      },
      dataChunk: {
        additionalPhonemeInfo: [
          {
            phoneme: v4(),
            startOffset: 100,
          },
        ],
        chunk: v4() as unknown as Uint8Array,
        type: DataChunkDataType.AUDIO,
      },
      timestamp: protoTimestamp(),
    };

    const result = InworldPacket.fromProto(packet);

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isAudio()).toEqual(true);
  });

  test('text', () => {
    const result = InworldPacket.fromProto(factory.text(v4()));

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isText()).toEqual(true);
  });

  test('trigger without parameters', () => {
    const result = InworldPacket.fromProto(factory.trigger(v4()));

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isTrigger()).toEqual(true);
  });

  test('trigger with parameters', () => {
    const result = InworldPacket.fromProto(
      factory.trigger(v4(), {
        parameters: [{ name: v4(), value: v4() }],
      }),
    );

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isTrigger()).toEqual(true);
  });

  test('emotion', () => {
    const packet: ProtoPacket = {
      packetId: { packetId: v4() },
      routing: {
        source: {} as Actor,
        targets: [{} as Actor],
      },
      emotion: {},
      timestamp: protoTimestamp(),
    };

    const result = InworldPacket.fromProto(packet);

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isEmotion()).toEqual(true);
  });

  test('silence', () => {
    const packet: ProtoPacket = {
      packetId: { packetId: v4() },
      routing: {
        source: {} as Actor,
        targets: [{} as Actor],
      },
      dataChunk: { durationMs: '100', type: DataChunkDataType.SILENCE },
      timestamp: protoTimestamp(),
    };

    const result = InworldPacket.fromProto(packet);

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isSilence()).toEqual(true);
  });

  test('cancelResponses', () => {
    const packet: ProtoPacket = {
      packetId: { packetId: v4() },
      routing: {
        source: {} as Actor,
        targets: [{} as Actor],
      },
      mutation: { cancelResponses: {} },
      timestamp: protoTimestamp(),
    };

    const result = InworldPacket.fromProto(packet);

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isCancelResponse()).toEqual(true);
  });

  test('narratedAction', () => {
    const packet: ProtoPacket = {
      packetId: { packetId: v4() },
      routing: {
        source: {} as Actor,
        targets: [{} as Actor],
      },
      action: {
        narratedAction: {
          content: v4(),
        },
      },
    };

    const result = InworldPacket.fromProto(packet);

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isNarratedAction()).toEqual(true);
  });

  test('unknown', () => {
    const packet: ProtoPacket = {
      packetId: { packetId: v4() },
      routing: {
        source: {} as Actor,
        targets: [{} as Actor],
      },
      timestamp: protoTimestamp(),
    };

    const result = InworldPacket.fromProto(packet);

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isEmotion()).toEqual(false);
    expect(result.isAudio()).toEqual(false);
    expect(result.isText()).toEqual(false);
    expect(result.isControl()).toEqual(false);
    expect(result.isTrigger()).toEqual(false);
  });

  describe('control', () => {
    test('interaction end', () => {
      const today = new Date();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.INTERACTION_END,
        },
        packetId: { packetId: v4() },
        routing: {
          source: {} as Actor,
          targets: [{} as Actor],
        },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.isInteractionEnd()).toEqual(true);
    });

    test('warning', () => {
      const today = new Date();
      const description = v4();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.WARNING,
          description,
        },
        packetId: { packetId: v4() },
        routing: {
          source: {} as Actor,
          targets: [{} as Actor],
        },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.isWarning()).toEqual(true);
      expect(result.control?.description).toEqual(description);
    });

    test('unknown', () => {
      const today = new Date();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.UNKNOWN,
        },
        packetId: { packetId: v4() },
        routing: {
          source: {} as Actor,
          targets: [{} as Actor],
        },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.isInteractionEnd()).toEqual(false);
    });
  });
});

describe('multi characters', () => {
  const internalCharacters = [createCharacter(), createCharacter()];

  beforeEach(() => {
    factory.setCharacters(internalCharacters);
  });

  test('should generate audio event using external characters', () => {
    const externalCharacters = [createCharacter(), createCharacter()];
    const targets = externalCharacters.map((c) => ({
      name: c.id,
      type: ActorType.AGENT,
    }));

    const chunk = v4();
    const event = factory.dataChunk(
      chunk,
      DataChunkDataType.AUDIO,
      externalCharacters,
    );

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.dataChunk).toEqual({
      chunk,
      type: DataChunkDataType.AUDIO,
    });
    expect(event.routing.targets).toEqual(targets);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate audio event using internal characters', () => {
    const targets = internalCharacters.map((c) => ({
      name: c.id,
      type: ActorType.AGENT,
    }));

    const chunk = v4();
    const event = factory.dataChunk(chunk, DataChunkDataType.AUDIO);

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.dataChunk).toEqual({
      chunk,
      type: DataChunkDataType.AUDIO,
    });
    expect(event.routing.targets).toEqual(targets);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });
});
