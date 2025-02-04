import { v4 } from 'uuid';

import {
  Actor,
  ActorType,
  AudioSessionStartPayloadMicrophoneMode,
  AudioSessionStartPayloadUnderstandingMode,
  ContinuationContinuationType,
  ControlEventAction,
  ConversationEventPayloadConversationEventType,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  LogsEventLogLevel,
  PerceivedLatencyReportPrecision as ProtoPerceivedLatencyReportPrecision,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  InworldConversationEventType,
  MicrophoneMode,
  UnderstandingMode,
} from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import { Character } from '../../src/entities/character.entity';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { PerceivedLatencyReportPrecisionType } from '../../src/entities/packets/latency/perceived_latency_report.entity';
import { EventFactory } from '../../src/factories/event';
import { capabilitiesProps, conversationId, createCharacter } from '../helpers';

let factory: EventFactory;
let character: Character;

const beforeEachFn = () => {
  character = createCharacter();
  factory = new EventFactory();
  factory.setCurrentCharacter(character);
};

test('should set and get character', () => {
  character = createCharacter();
  factory = new EventFactory();
  factory.setCurrentCharacter(character);

  const found = factory.getCurrentCharacter();

  expect(found).toEqual(character);
  expect(found?.id).toEqual(character.id);
});

test('should validate event', () => {
  jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn());

  factory = new EventFactory({ validateData: true });

  // @ts-ignore
  factory.text(123, { conversationId });

  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledWith(
    'Invalid packet',
    expect.anything(),
  );
});

describe('event types', () => {
  beforeEach(beforeEachFn);

  test('should generate audio event', () => {
    jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn());

    const chunk = v4();
    const event = factory.dataChunk(chunk, DataChunkDataType.AUDIO, {
      conversationId,
    });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.dataChunk).toEqual({
      chunk,
      type: DataChunkDataType.AUDIO,
    });
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
    expect(event.packetId?.conversationId).toEqual(conversationId);
    expect(console.warn).toHaveBeenCalledTimes(0);
  });

  test('should generate audio session start', () => {
    const event = factory.audioSessionStart({ conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.AUDIO_SESSION_START,
      audioSessionStart: {
        mode: AudioSessionStartPayloadMicrophoneMode.OPEN_MIC,
        understandingMode: AudioSessionStartPayloadUnderstandingMode.FULL,
      },
    });
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test.each([
    {
      input: MicrophoneMode.EXPECT_AUDIO_END,
      expected: AudioSessionStartPayloadMicrophoneMode.EXPECT_AUDIO_END,
    },
    {
      input: MicrophoneMode.OPEN_MIC,
      expected: AudioSessionStartPayloadMicrophoneMode.OPEN_MIC,
    },
  ])(
    'should generate audio session start with microphone $input',
    ({ input, expected }) => {
      const event = factory.audioSessionStart({
        conversationId,
        mode: input,
      });

      expect(event.control?.action).toEqual(
        ControlEventAction.AUDIO_SESSION_START,
      );
      expect(event.control?.audioSessionStart?.mode).toEqual(expected);
      expect(event.routing?.target).toBeFalsy();
      expect(event.packetId).toHaveProperty('packetId');
      expect(event.packetId?.utteranceId).toBeUndefined();
      expect(event.packetId?.interactionId).toBeUndefined();
      expect(event.packetId?.correlationId).toBeUndefined();
      expect(event.packetId?.conversationId).toEqual(conversationId);
    },
  );

  test.each([
    {
      input: UnderstandingMode.FULL,
      expected: AudioSessionStartPayloadUnderstandingMode.FULL,
    },
    {
      input: UnderstandingMode.SPEECH_RECOGNITION_ONLY,
      expected:
        AudioSessionStartPayloadUnderstandingMode.SPEECH_RECOGNITION_ONLY,
    },
  ])(
    'should generate audio session start with understandingMode $input',
    ({ input, expected }) => {
      const event = factory.audioSessionStart({
        conversationId,
        understandingMode: input,
      });

      expect(event.control?.action).toEqual(
        ControlEventAction.AUDIO_SESSION_START,
      );
      expect(event.control?.audioSessionStart?.understandingMode).toEqual(
        expected,
      );
      expect(event.routing?.target).toBeFalsy();
      expect(event.packetId).toHaveProperty('packetId');
      expect(event.packetId?.utteranceId).toBeUndefined();
      expect(event.packetId?.interactionId).toBeUndefined();
      expect(event.packetId?.correlationId).toBeUndefined();
      expect(event.packetId?.conversationId).toEqual(conversationId);
    },
  );

  test('should generate audio session end', () => {
    const event = factory.audioSessionEnd({ conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.AUDIO_SESSION_END,
    });
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate tts playback mute', () => {
    const event = factory.mutePlayback(true, { conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.TTS_PLAYBACK_MUTE,
    });
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate tts playback unmute', () => {
    const event = factory.mutePlayback(false, { conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control).toEqual({
      action: ControlEventAction.TTS_PLAYBACK_UNMUTE,
    });
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate text event', () => {
    const text = v4();
    const event = factory.text(text, { conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.text.text).toEqual(text);
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate trigger event without parameters', () => {
    const name = v4();
    const event = factory.trigger(name, { conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.custom.name).toEqual(name);
    expect(event.custom.parameters).toEqual(undefined);
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate trigger event with parameters', () => {
    const name = v4();
    const parameters = [{ name: v4(), value: v4() }];
    const event = factory.trigger(name, { parameters, conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.custom.name).toEqual(name);
    expect(event.custom.parameters).toEqual(parameters);
    expect(event.routing.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate trigger with character', () => {
    const name = v4();
    const event = factory.trigger(name, { character, conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.custom?.name).toEqual(name);
    expect(event.routing?.target?.type).toEqual(ActorType.AGENT);
    expect(event.routing?.target?.name).toEqual(character.id);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate cancel response event', () => {
    const interactionId = v4();
    const utteranceId = [v4()];
    const event = factory.cancelResponse({
      interactionId,
      utteranceId,
    });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.mutation?.cancelResponses).toEqual({
      interactionId,
      utteranceId,
    });
    expect(event.routing?.target).toEqual({
      type: ActorType.WORLD,
    });
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId).toHaveProperty('correlationId');
  });

  test('should generate perceived latency report', () => {
    const interactionId = v4();
    const startDate = new Date();
    const endDate = new Date();
    const event = factory.perceivedLatency({
      precision: PerceivedLatencyReportPrecisionType.FINE,
      interactionId,
      startDate,
      endDate,
    });

    const report = event.latencyReport!.perceivedLatency;

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(report?.precision).toEqual(
      ProtoPerceivedLatencyReportPrecision.FINE,
    );
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId!.conversationId).toBeFalsy();
    expect(event.packetId!.correlationId).toBeFalsy();
    expect(event.packetId!.conversationId).toBeFalsy();
  });

  test('should generate narrated action event', () => {
    const text = v4();
    const event = factory.narratedAction(text, { conversationId });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.action?.narratedAction?.content).toEqual(text);
    expect(event.routing?.target).toBeFalsy();
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId).toHaveProperty('interactionId');
    expect(event.packetId).toHaveProperty('utteranceId');
    expect(event.packetId).toHaveProperty('correlationId');
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate session control capabilities', () => {
    const event = factory.sessionControl({
      capabilities: capabilitiesProps,
    });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(
      event.control?.sessionConfiguration?.capabilitiesConfiguration,
    ).toEqual(capabilitiesProps);
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control session configuration', () => {
    const sessionConfiguration = { gameSessionId: v4() };
    const event = factory.sessionControl({ sessionConfiguration });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control?.sessionConfiguration?.sessionConfiguration).toEqual(
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
    const event = factory.sessionControl({ clientConfiguration });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control?.sessionConfiguration?.clientConfiguration).toEqual(
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
    const event = factory.sessionControl({ userConfiguration });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control?.sessionConfiguration?.userConfiguration).toEqual(
      userConfiguration,
    );
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
    const event = factory.sessionControl({ continuation });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control?.sessionConfiguration?.continuation).toEqual(
      continuation,
    );
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
    const event = factory.sessionControl({ continuation });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.control?.sessionConfiguration?.continuation).toEqual(
      continuation,
    );
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate session control history', () => {
    const sessionHistory = {};
    const event = factory.sessionControl({ sessionHistory });

    expect(event).toHaveProperty('routing');
    expect(event).toHaveProperty('timestamp');
    expect(event.sessionControl?.sessionHistoryRequest).toEqual(sessionHistory);
    expect(event.routing?.target?.type).toEqual(ActorType.WORLD);
    expect(event.packetId).toHaveProperty('packetId');
    expect(event.packetId?.utteranceId).toBeUndefined();
    expect(event.packetId?.interactionId).toBeUndefined();
    expect(event.packetId?.correlationId).toBeUndefined();
  });

  test('should generate conversation start event', () => {
    const characters = [v4(), v4()];
    const event = factory.conversation(characters, {
      conversationId,
    });
    expect(event.control?.action).toEqual(
      ControlEventAction.CONVERSATION_UPDATE,
    );
    expect(event.control!.conversationUpdate?.participants).toEqual(
      characters.map((p) => ({ name: p, type: ActorType.AGENT })),
    );
    expect(event.packetId?.conversationId).toEqual(conversationId);
  });

  test('should generate base packet without conversationId', () => {
    const event = factory.baseProtoPacket({
      correlationId: true,
    });

    expect(event.packetId.conversationId).toBeFalsy();
  });

  test('should generate base packet with conversationId', () => {
    const event = factory.baseProtoPacket({
      correlationId: true,
      conversationId,
    });

    expect(event.packetId.conversationId).toEqual(conversationId);
  });
});

describe('convert packet to external one', () => {
  beforeEach(beforeEachFn);

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
    const result = InworldPacket.fromProto(
      factory.text(v4(), {
        conversationId,
      }),
    );

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isText()).toEqual(true);
  });

  test('trigger without parameters', () => {
    const result = InworldPacket.fromProto(
      factory.trigger(v4(), {
        conversationId,
      }),
    );

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isTrigger()).toEqual(true);
  });

  test('trigger with parameters', () => {
    const result = InworldPacket.fromProto(
      factory.trigger(v4(), {
        parameters: [{ name: v4(), value: v4() }],
        conversationId,
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

  test('log', () => {
    const packet: ProtoPacket = {
      packetId: { packetId: v4() },
      routing: {
        source: {} as Actor,
        targets: [{} as Actor],
      },
      log: {
        text: v4(),
        level: LogsEventLogLevel.INFO,
      },
    };

    const result = InworldPacket.fromProto(packet);

    expect(result).toBeInstanceOf(InworldPacket);
    expect(result.isLog()).toEqual(true);
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

    test('outgoing conversation', () => {
      const today = new Date();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.CONVERSATION_UPDATE,
        },
        packetId: { packetId: v4(), conversationId },
        routing: { source: {} as Actor },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.packetId.conversationId).toEqual(conversationId);
      expect(result.date).toEqual(today.toISOString());
    });

    test('incoming conversation started', () => {
      const today = new Date();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.CONVERSATION_EVENT,
          conversationEvent: {
            eventType: ConversationEventPayloadConversationEventType.STARTED,
          },
        },
        packetId: { packetId: v4(), conversationId },
        routing: { source: {} as Actor },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.packetId.conversationId).toEqual(conversationId);
      expect(result.control.conversation?.type).toEqual(
        InworldConversationEventType.STARTED,
      );
      expect(result.date).toEqual(today.toISOString());
    });

    test('incoming conversation updated', () => {
      const today = new Date();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.CONVERSATION_EVENT,
          conversationEvent: {
            eventType: ConversationEventPayloadConversationEventType.UPDATED,
          },
        },
        packetId: { packetId: v4(), conversationId },
        routing: { source: {} as Actor },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.packetId.conversationId).toEqual(conversationId);
      expect(result.control.conversation?.type).toEqual(
        InworldConversationEventType.UPDATED,
      );
      expect(result.date).toEqual(today.toISOString());
    });

    test('incoming conversation evicted', () => {
      const today = new Date();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.CONVERSATION_EVENT,
          conversationEvent: {
            eventType: ConversationEventPayloadConversationEventType.EVICTED,
          },
        },
        packetId: { packetId: v4(), conversationId },
        routing: { source: {} as Actor },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.packetId.conversationId).toEqual(conversationId);
      expect(result.control.conversation?.type).toEqual(
        InworldConversationEventType.EVICTED,
      );
      expect(result.date).toEqual(today.toISOString());
    });

    test('incoming conversation unknown', () => {
      const today = new Date();
      const packet: ProtoPacket = {
        control: {
          action: ControlEventAction.CONVERSATION_EVENT,
          conversationEvent: {},
        },
        packetId: { packetId: v4(), conversationId },
        routing: { source: {} as Actor },
        timestamp: protoTimestamp(today),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isControl()).toEqual(true);
      expect(result.packetId.conversationId).toEqual(conversationId);
      expect(result.control.conversation?.type).toEqual(
        InworldConversationEventType.UNKNOWN,
      );
      expect(result.date).toEqual(today.toISOString());
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

  describe('entities and items', () => {
    test('operation status', () => {
      const packet: ProtoPacket = {
        packetId: { packetId: v4() },
        routing: {
          source: {} as Actor,
          targets: [{} as Actor],
        },
        operationStatus: {
          status: {
            code: 200,
            message: v4(),
            details: [],
          },
        },
        timestamp: protoTimestamp(),
      };

      const result = InworldPacket.fromProto(packet);

      expect(result).toBeInstanceOf(InworldPacket);
      expect(result.isOperationStatus()).toEqual(true);
    });
  });
});
