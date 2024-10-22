import {
  Agent,
  ControlEventAction,
  CustomEventType,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  LoadCharactersCharacterName,
} from '../../../proto/ai/inworld/packets/packets.pb';
import {
  InworlControlAction,
  InworldPacketType,
} from '../../common/data_structures';
import { Character } from '../character.entity';
import { ItemOperation } from '../entities/item_operation';
import { AudioEvent } from './audio.entity';
import { CancelResponsesEvent } from './cancel_responses.entity';
import { ControlEvent } from './control.entity';
import { EmotionEvent } from './emotion/emotion.entity';
import { LatencyReportEvent } from './latency/latency_report.entity';
import { LogsEvent } from './log.entity';
import { NarratedAction } from './narrated_action.entity';
import { OperationStatusEvent } from './operation_status.entity';
import { PacketId } from './packet_id.entity';
import { Routing } from './routing.entity';
import { SilenceEvent } from './silence.entity';
import { TaskEvent } from './task.entity';
import { TextEvent } from './text.entity';
import { TriggerEvent } from './trigger.entity';

export interface InworldPacketProps {
  audio?: AudioEvent;
  cancelResponses?: CancelResponsesEvent;
  control?: ControlEvent;
  task?: TaskEvent;
  trigger?: TriggerEvent;
  emotions?: EmotionEvent;
  log?: LogsEvent;
  packetId: PacketId;
  routing: Routing;
  silence?: SilenceEvent;
  text?: TextEvent;
  narratedAction?: NarratedAction;
  sceneMutation?: SceneMutation;
  entitiesItemsOperation?: ItemOperation;
  operationStatus?: OperationStatusEvent;
  latencyReport?: LatencyReportEvent;
  date: string;
  type: InworldPacketType;
}

export interface SceneMutation {
  name?: string;
  description?: string;
  displayName?: string;
  addedCharacterNames?: string[];
  removedCharacterIds?: string[];
  loadedCharacters?: Character[];
}

export class InworldPacket {
  private type: InworldPacketType = InworldPacketType.UNKNOWN;

  readonly date: string;
  readonly packetId: PacketId;
  readonly routing: Routing;

  // Events
  readonly text: TextEvent;
  readonly audio: AudioEvent;
  readonly task: TaskEvent;
  readonly trigger: TriggerEvent;
  readonly control: ControlEvent;
  readonly emotions: EmotionEvent;
  readonly log: LogsEvent;
  readonly silence: SilenceEvent;
  readonly narratedAction: NarratedAction;
  readonly cancelResponses: CancelResponsesEvent;
  readonly sceneMutation: SceneMutation;
  readonly entitiesItemsOperation: ItemOperation;
  readonly operationStatus: OperationStatusEvent;
  readonly latencyReport: LatencyReportEvent;

  constructor(props: InworldPacketProps) {
    this.packetId = props.packetId;
    this.routing = props.routing;
    this.date = props.date;
    this.type = props.type;

    if (this.isText()) {
      this.text = props.text;
    }

    if (this.isAudio()) {
      this.audio = props.audio;
    }

    if (this.isControl()) {
      this.control = props.control;
    }

    if (this.isEmotion()) {
      this.emotions = props.emotions;
    }

    if (this.isLog()) {
      this.log = props.log;
    }

    if (this.isTask()) {
      this.task = props.task;
    }

    if (this.isTrigger()) {
      this.trigger = props.trigger;
    }

    if (this.isSilence()) {
      this.silence = props.silence;
    }

    if (this.isCancelResponse()) {
      this.cancelResponses = props.cancelResponses;
    }

    if (this.isNarratedAction()) {
      this.narratedAction = props.narratedAction;
    }

    if (this.isSceneMutationResponse() || this.isSceneMutationRequest()) {
      this.sceneMutation = props.sceneMutation;
    }

    if (this.isEntitiesItemOperation()) {
      this.entitiesItemsOperation = props.entitiesItemsOperation;
    }

    if (this.isOperationStatus()) {
      this.operationStatus = props.operationStatus;
    }

    if (this.isLatencyReport()) {
      this.latencyReport = props.latencyReport;
    }
  }

  isText() {
    return this.type === InworldPacketType.TEXT;
  }

  isAudio() {
    return this.type === InworldPacketType.AUDIO;
  }

  isControl() {
    return this.type === InworldPacketType.CONTROL;
  }

  isTask() {
    return this.type === InworldPacketType.TASK;
  }

  isTrigger() {
    return this.type === InworldPacketType.TRIGGER;
  }

  isEmotion() {
    return this.type === InworldPacketType.EMOTION;
  }

  isLog() {
    return this.type === InworldPacketType.LOG;
  }

  isInteractionEnd() {
    return (
      this.isControl() &&
      this.control.action === InworlControlAction.INTERACTION_END
    );
  }

  isTTSPlaybackMute() {
    return (
      this.isControl() &&
      this.control.action === InworlControlAction.TTS_PLAYBACK_MUTE
    );
  }

  isTTSPlaybackUnmute() {
    return (
      this.isControl() &&
      this.control.action === InworlControlAction.TTS_PLAYBACK_UNMUTE
    );
  }

  isWarning() {
    return (
      this.isControl() && this.control.action === InworlControlAction.WARNING
    );
  }

  isSilence() {
    return this.type === InworldPacketType.SILENCE;
  }

  isCancelResponse() {
    return this.type === InworldPacketType.CANCEL_RESPONSE;
  }

  isNarratedAction() {
    return this.type === InworldPacketType.NARRATED_ACTION;
  }

  isSceneMutationRequest() {
    return this.type === InworldPacketType.SCENE_MUTATION_REQUEST;
  }

  isSceneMutationResponse() {
    return this.type === InworldPacketType.SCENE_MUTATION_RESPONSE;
  }

  isEntitiesItemOperation() {
    return this.type === InworldPacketType.ENTITIES_ITEM_OPERATION;
  }

  isOperationStatus() {
    return this.type === InworldPacketType.OPERATION_STATUS;
  }

  isLatencyReport() {
    return this.type === InworldPacketType.LATENCY_REPORT;
  }

  isPingPongReport() {
    return this.isLatencyReport() && this.latencyReport.pingPong;
  }

  isPerceivedLatencyReport() {
    return this.isLatencyReport() && this.latencyReport.perceivedLatency;
  }

  shouldHaveConversationId() {
    return (
      this.isAudio() ||
      this.isText() ||
      this.isTrigger() ||
      this.isTask() ||
      this.isNarratedAction() ||
      this.isSilence()
    );
  }

  static fromProto(proto: ProtoPacket): InworldPacket {
    const type = this.getType(proto);

    return new InworldPacket({
      type,
      date: proto.timestamp,
      packetId: PacketId.fromProto(proto.packetId),
      routing: Routing.fromProto(proto.routing),
      ...(type === InworldPacketType.TRIGGER && {
        trigger: TriggerEvent.fromProto(proto.custom),
      }),
      ...(type === InworldPacketType.TASK && {
        task: TaskEvent.fromProto(proto.custom),
      }),
      ...(type === InworldPacketType.TEXT && {
        text: TextEvent.fromProto(proto.text),
      }),
      ...(type === InworldPacketType.AUDIO && {
        audio: AudioEvent.fromProto(proto.dataChunk),
      }),
      ...(type === InworldPacketType.CONTROL && {
        control: ControlEvent.fromProto(proto.control),
      }),
      ...(type === InworldPacketType.SILENCE && {
        silence: SilenceEvent.fromProto(proto.dataChunk),
      }),
      ...(type === InworldPacketType.EMOTION && {
        emotions: EmotionEvent.fromProto(proto.emotion),
      }),
      ...(type === InworldPacketType.LATENCY_REPORT && {
        latencyReport: LatencyReportEvent.fromProto(proto.latencyReport),
      }),
      ...(type === InworldPacketType.LOG && {
        log: LogsEvent.fromProto(proto.log),
      }),
      ...(type === InworldPacketType.CANCEL_RESPONSE && {
        cancelResponses: CancelResponsesEvent.fromProto(proto.mutation),
      }),
      ...(type === InworldPacketType.NARRATED_ACTION && {
        narratedAction: NarratedAction.fromProto(proto.action),
      }),
      ...(type === InworldPacketType.ENTITIES_ITEM_OPERATION && {
        entitiesItemsOperation: ItemOperation.fromProto(
          proto.entitiesItemsOperation,
        ),
      }),
      ...(type === InworldPacketType.OPERATION_STATUS && {
        operationStatus: OperationStatusEvent.fromProto(proto.operationStatus),
      }),
      ...([
        InworldPacketType.SCENE_MUTATION_REQUEST,
        InworldPacketType.SCENE_MUTATION_RESPONSE,
      ].includes(type) && {
        sceneMutation: {
          ...(proto.mutation?.loadScene && {
            name: proto.mutation.loadScene.name,
          }),
          ...(proto.mutation?.loadCharacters && {
            addedCharacterNames: proto.mutation.loadCharacters.name.map(
              (c: LoadCharactersCharacterName) => c.name,
            ),
          }),
          ...(proto.mutation?.unloadCharacters && {
            removedCharacterIds: proto.mutation.unloadCharacters.agents.map(
              (c: Agent) => c.agentId,
            ),
          }),
          ...(proto.control?.currentSceneStatus && {
            name: proto.control.currentSceneStatus.sceneName,
            description: proto.control.currentSceneStatus.sceneDescription,
            displayName: proto.control.currentSceneStatus.sceneDisplayName,
            loadedCharacters: proto.control.currentSceneStatus.agents.map(
              (agent: Agent) => Character.fromProto(agent),
            ),
          }),
        },
      }),
    });
  }

  private static getType(packet: ProtoPacket) {
    console.log('inworld_packet.entity getType:', packet);
    if (
      packet.mutation?.loadScene ||
      packet.mutation?.loadCharacters ||
      packet.mutation?.unloadCharacters
    ) {
      return InworldPacketType.SCENE_MUTATION_REQUEST;
    } else if (
      packet.control?.action === ControlEventAction.CURRENT_SCENE_STATUS
    ) {
      return InworldPacketType.SCENE_MUTATION_RESPONSE;
    } else if (packet.text) {
      return InworldPacketType.TEXT;
    } else if (
      packet.dataChunk &&
      packet.dataChunk.type === DataChunkDataType.AUDIO
    ) {
      return InworldPacketType.AUDIO;
    } else if (
      packet.dataChunk &&
      packet.dataChunk.type === DataChunkDataType.SILENCE
    ) {
      return InworldPacketType.SILENCE;
    } else if (packet.latencyReport) {
      return InworldPacketType.LATENCY_REPORT;
    } else if (packet.custom && packet.custom.type === CustomEventType.TASK) {
      return InworldPacketType.TASK;
    } else if (packet.custom) {
      return InworldPacketType.TRIGGER;
    } else if (packet.control) {
      return InworldPacketType.CONTROL;
    } else if (packet.emotion) {
      return InworldPacketType.EMOTION;
    } else if (packet.log) {
      return InworldPacketType.LOG;
    } else if (packet.mutation?.cancelResponses) {
      return InworldPacketType.CANCEL_RESPONSE;
    } else if (packet.action?.narratedAction) {
      return InworldPacketType.NARRATED_ACTION;
    } else if (packet.entitiesItemsOperation) {
      return InworldPacketType.ENTITIES_ITEM_OPERATION;
    } else if (packet.operationStatus) {
      return InworldPacketType.OPERATION_STATUS;
    } else {
      return InworldPacketType.UNKNOWN;
    }
  }
}
