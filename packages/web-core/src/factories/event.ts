import * as snakecaseKeys from 'snakecase-keys';
import { v4 } from 'uuid';

import {
  Actor,
  ActorType,
  Agent,
  AudioSessionStartPayloadMicrophoneMode,
  AudioSessionStartPayloadUnderstandingMode,
  ControlEvent,
  ControlEventAction,
  CustomEventType,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  LoadCharactersCharacterName,
  MutationEvent,
  PerceivedLatencyReportPrecision,
  PingPongReportType,
  Routing,
  SessionConfigurationPayload,
  TextEventSourceType,
} from '../../proto/ai/inworld/packets/packets.pb';
import {
  ConversationParticipant,
  ItemsInEntitiesOperationType,
  MicrophoneMode,
  PerceivedLatencyReportProps,
  SendAudioSessionStartPacketParams,
  SendCustomPacketParams,
  SendPacketParams,
  SessionControlProps,
  UnderstandingMode,
} from '../common/data_structures';
import { calculateTimeDifference, protoTimestamp } from '../common/helpers';
import { Character } from '../entities/character.entity';
import { EntityItem } from '../entities/entities/entity_item';
import { ItemOperation } from '../entities/entities/item_operation';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { PerceivedLatencyReport } from '../entities/packets/latency/perceived_latency_report.entity';
import { PacketId } from '../entities/packets/packet_id.entity';
import { InworldPacketSchema } from '../zod/schema';

export interface SendCancelResponsePacketParams {
  interactionId?: string;
  utteranceId?: string[];
}

export class EventFactory {
  private validateData: boolean;
  private character: Character | undefined = undefined;
  private characters: Character[] = [];

  constructor({ validateData = false } = {}) {
    this.validateData = validateData;
  }

  getCurrentCharacter() {
    return this.character;
  }

  setCurrentCharacter(character: Character) {
    this.character = character;
  }

  setCharacters(characters: Character[]) {
    this.characters = characters;
  }

  getCharacters() {
    return this.characters;
  }

  dataChunk(
    chunk: string,
    type: DataChunkDataType,
    params: SendPacketParams,
  ): ProtoPacket {
    const packet = {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        conversationId: params.conversationId,
      }),
      dataChunk: { chunk: chunk as unknown as Uint8Array, type },
    };

    this.validate(packet);

    return packet;
  }

  audioSessionStart(params: SendAudioSessionStartPacketParams): ProtoPacket {
    const packet = this.audioSession(
      ControlEventAction.AUDIO_SESSION_START,
      params,
    );

    this.validate(packet);

    return packet;
  }

  audioSessionEnd(params: SendPacketParams): ProtoPacket {
    const packet = this.audioSession(
      ControlEventAction.AUDIO_SESSION_END,
      params,
    );

    this.validate(packet);

    return packet;
  }

  pong(packetId: PacketId, pingTimestamp: string): ProtoPacket {
    const packet = {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
      }),
      latencyReport: {
        pingPong: {
          pingPacketId: { ...packetId },
          pingTimestamp,
          type: PingPongReportType.PONG,
        },
      },
    };

    this.validate(packet);

    return packet;
  }

  perceivedLatencyWithTypeDetection({
    sent,
    received,
  }: {
    sent: InworldPacket;
    received: InworldPacket;
  }): ProtoPacket {
    const duration = calculateTimeDifference(new Date(sent.date), new Date());
    let precision = PerceivedLatencyReportPrecision.UNSPECIFIED;

    if (sent.isAudioSessionEnd()) {
      precision = PerceivedLatencyReportPrecision.PUSH_TO_TALK;
    } else if (
      (sent.isPlayerTypeInText() || sent.isSpeechRecognitionResult()) &&
      received.isAudio()
    ) {
      precision = PerceivedLatencyReportPrecision.ESTIMATED;
    } else if (sent.isNonSpeechPacket() || sent.isPlayerTypeInText()) {
      precision = PerceivedLatencyReportPrecision.NON_SPEECH;
    }

    const event = {
      perceivedLatency: {
        latency: duration,
        precision,
      },
    };

    const basePacket = this.baseProtoPacket({
      utteranceId: false,
      interactionId: false,
    });
    const basePacketId = basePacket.packetId;

    const packet = {
      ...basePacket,
      packetId: {
        ...basePacketId,
        interactionId: received.packetId.interactionId,
      },
      latencyReport: event,
    };

    this.validate(packet);

    return packet;
  }

  perceivedLatency({
    precision,
    interactionId,
    startDate,
    endDate,
  }: PerceivedLatencyReportProps): ProtoPacket {
    const duration = calculateTimeDifference(startDate, endDate);

    const event = {
      perceivedLatency: {
        latency: duration,
        precision:
          PerceivedLatencyReport.getProtoPerceivedLatencyReportPrecision(
            precision,
          ),
      },
    };

    const basePacket = this.baseProtoPacket({
      utteranceId: false,
      interactionId: false,
    });
    const basePacketId = basePacket.packetId;

    const packet = {
      ...basePacket,
      packetId: {
        ...basePacketId,
        interactionId,
      },
      latencyReport: event,
    };

    this.validate(packet);

    return packet;
  }

  mutePlayback(isMuted: boolean, params: SendPacketParams): ProtoPacket {
    const packet = {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        conversationId: params.conversationId,
      }),
      control: {
        action: isMuted
          ? ControlEventAction.TTS_PLAYBACK_MUTE
          : ControlEventAction.TTS_PLAYBACK_UNMUTE,
      },
    };

    this.validate(packet);

    return packet;
  }

  text(text: string, params: SendPacketParams): ProtoPacket {
    const packet = {
      ...this.baseProtoPacket({
        correlationId: true,
        conversationId: params.conversationId,
      }),
      text: {
        sourceType: TextEventSourceType.TYPED_IN,
        text,
        final: true,
      },
    };

    this.validate(packet);

    return packet;
  }

  trigger(name: string, params: SendCustomPacketParams): ProtoPacket {
    const packet = this.customEvent(name, CustomEventType.TRIGGER, params);

    this.validate(packet);

    return packet;
  }

  cancelResponse(params: SendCancelResponsePacketParams): ProtoPacket {
    const packet = {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        correlationId: true,
      }),
      mutation: {
        cancelResponses: {
          interactionId: params.interactionId,
          utteranceId: params.utteranceId,
        },
      },
      routing: this.routing({
        target: { type: ActorType.WORLD },
      }),
    };

    this.validate(packet);

    return packet;
  }

  narratedAction(content: string, params: SendPacketParams): ProtoPacket {
    const packet = {
      ...this.baseProtoPacket({
        correlationId: true,
        conversationId: params.conversationId,
      }),
      action: {
        narratedAction: {
          content,
        },
      },
    };

    this.validate(packet);

    return packet;
  }

  conversation(participants: string[], params: SendPacketParams): ProtoPacket {
    const control = {
      action: ControlEventAction.CONVERSATION_UPDATE,
      conversationUpdate: {
        participants: participants.map((p) =>
          p === ConversationParticipant.USER
            ? {
                type: ActorType.PLAYER,
              }
            : {
                name: p,
                type: ActorType.AGENT,
              },
        ),
      },
    } as ControlEvent;

    const packet = {
      packetId: {
        packetId: v4(),
        conversationId: params.conversationId,
      },
      timestamp: protoTimestamp(),
      control,
    };

    this.validate(packet);

    return packet;
  }

  sessionControl(props: SessionControlProps): ProtoPacket {
    const sessionConfiguration = {
      ...(!!props.capabilities && {
        capabilitiesConfiguration: props.capabilities,
      }),
      ...(!!props.sessionConfiguration && {
        sessionConfiguration: props.sessionConfiguration,
      }),
      ...(!!props.clientConfiguration && {
        clientConfiguration: props.clientConfiguration,
      }),
      ...(!!props.userConfiguration && {
        userConfiguration: props.userConfiguration,
      }),
      ...(!!props.continuation && { continuation: props.continuation }),
    } as SessionConfigurationPayload;

    const packet = {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: EventFactory.worldRouting(),
      ...(Object.keys(sessionConfiguration).length
        ? {
            control: {
              action: ControlEventAction.SESSION_CONFIGURATION,
              sessionConfiguration,
            },
          }
        : {
            ...(props.sessionHistory && {
              sessionControl: { sessionHistoryRequest: props.sessionHistory },
            }),
          }),
    };

    this.validate(packet);

    return packet;
  }

  loadScene(name: string): ProtoPacket {
    const mutation = { loadScene: { name } } as MutationEvent;

    const packet = {
      packetId: {
        packetId: v4(),
        interactionId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: EventFactory.worldRouting(),
      mutation,
    };

    this.validate(packet);

    return packet;
  }

  loadCharacters(names: string[]): ProtoPacket {
    const name = names.map(
      (name) =>
        ({
          name,
        }) as LoadCharactersCharacterName,
    );

    const mutation = { loadCharacters: { name } } as MutationEvent;

    const packet = {
      packetId: { packetId: v4() },
      timestamp: protoTimestamp(),
      routing: EventFactory.worldRouting(),
      mutation,
    };

    this.validate(packet);

    return packet;
  }

  unloadCharacters(ids: string[]): ProtoPacket {
    const agents = ids.map((agentId) => ({ agentId }) as Agent);

    const mutation = { unloadCharacters: { agents } } as MutationEvent;

    const packet = {
      packetId: { packetId: v4() },
      timestamp: protoTimestamp(),
      routing: EventFactory.worldRouting(),
      mutation,
    };

    this.validate(packet);

    return packet;
  }

  baseProtoPacket({
    utteranceId = true,
    interactionId = true,
    correlationId,
    conversationId,
  }: {
    utteranceId?: boolean;
    interactionId?: boolean;
    correlationId?: boolean;
    conversationId?: string;
  } = {}) {
    return {
      packetId: {
        packetId: v4(),
        ...(utteranceId && { utteranceId: v4() }),
        ...(interactionId && { interactionId: v4() }),
        ...(correlationId && { correlationId: v4() }),
        ...(conversationId && { conversationId }),
      },
      timestamp: protoTimestamp(),
      routing: this.routing(),
    };
  }

  private audioSession(
    action:
      | ControlEventAction.AUDIO_SESSION_START
      | ControlEventAction.AUDIO_SESSION_END,
    params: SendAudioSessionStartPacketParams,
  ): ProtoPacket {
    let mode;
    let understandingMode;

    if (action === ControlEventAction.AUDIO_SESSION_START) {
      mode =
        params.mode === MicrophoneMode.EXPECT_AUDIO_END
          ? AudioSessionStartPayloadMicrophoneMode.EXPECT_AUDIO_END
          : AudioSessionStartPayloadMicrophoneMode.OPEN_MIC;

      understandingMode =
        params.understandingMode === UnderstandingMode.SPEECH_RECOGNITION_ONLY
          ? AudioSessionStartPayloadUnderstandingMode.SPEECH_RECOGNITION_ONLY
          : AudioSessionStartPayloadUnderstandingMode.FULL;
    }

    return {
      ...this.baseProtoPacket({
        utteranceId: false,
        interactionId: false,
        conversationId: params.conversationId,
      }),
      control: {
        action,
        ...((mode || understandingMode) && {
          audioSessionStart: { mode, understandingMode },
        }),
      },
    };
  }

  private customEvent(
    name: string,
    type: CustomEventType,
    params: SendCustomPacketParams,
  ): ProtoPacket {
    const { parameters = [], character, conversationId } = params;

    return {
      ...this.baseProtoPacket({ correlationId: true, conversationId }),
      ...(character && {
        routing: this.routing({
          target: { name: character.id, type: ActorType.AGENT },
        }),
      }),
      custom: {
        name,
        type,
        parameters: parameters.length ? parameters : undefined,
      },
    };
  }

  private routing(props?: { target: Actor }): Routing {
    return {
      source: { type: ActorType.PLAYER },
      ...(props?.target && { target: props.target }),
    };
  }

  private static worldRouting(): Routing {
    return {
      source: { type: ActorType.PLAYER },
      target: { type: ActorType.WORLD },
    };
  }

  private validate(packet: ProtoPacket) {
    if (!this.validateData) {
      return;
    }

    const inSnakeCase = snakecaseKeys.default(packet);
    const result = InworldPacketSchema.safeParse(inSnakeCase);

    if (!result.success) {
      console.warn('Invalid packet', {
        packet: inSnakeCase,
        errors: result.error.errors,
      });
    }
  }

  createOrUpdateItems(props: {
    items: EntityItem[];
    addToEntities: string[];
  }): ProtoPacket {
    const packet = {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: EventFactory.worldRouting(),
      entitiesItemsOperation: new ItemOperation({
        createOrUpdateItems: props,
      }).toProto(),
    };

    this.validate(packet);

    return packet;
  }

  removeItems(ids: string[]): ProtoPacket {
    const packet = {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: EventFactory.worldRouting(),
      entitiesItemsOperation: new ItemOperation({
        removeItems: { itemIds: ids },
      }).toProto(),
    };

    this.validate(packet);

    return packet;
  }

  itemsInEntities(props: {
    type: ItemsInEntitiesOperationType;
    itemIds: string[];
    entityNames: string[];
  }): ProtoPacket {
    const packet = {
      packetId: {
        packetId: v4(),
      },
      timestamp: protoTimestamp(),
      routing: EventFactory.worldRouting(),
      entitiesItemsOperation: new ItemOperation({
        itemsInEntities: props,
      }).toProto(),
    };

    this.validate(packet);

    return packet;
  }
}
