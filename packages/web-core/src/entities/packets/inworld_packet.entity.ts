import {
  Agent,
  DataChunkDataType,
  InworldPacket as ProtoPacket,
  LoadCharactersCharacterName,
} from '../../../proto/ai/inworld/packets/packets.pb';
import {
  InworlControlAction,
  InworldPacketType,
} from '../../common/data_structures';
import { Character } from '../character.entity';
import { AudioEvent } from './audio.entity';
import { CancelResponsesEvent } from './cancel_responses.entity';
import { ControlEvent } from './control.entity';
import { EmotionEvent } from './emotion/emotion.entity';
import { NarratedAction } from './narrated_action.entity';
import { PacketId } from './packet_id.entity';
import { Routing } from './routing.entity';
import { SilenceEvent } from './silence.entity';
import { TextEvent } from './text.entity';
import { TriggerEvent } from './trigger.entity';

export interface InworldPacketProps {
  audio?: AudioEvent;
  cancelResponses?: CancelResponsesEvent;
  control?: ControlEvent;
  trigger?: TriggerEvent;
  emotions?: EmotionEvent;
  packetId: PacketId;
  routing: Routing;
  silence?: SilenceEvent;
  text?: TextEvent;
  narratedAction?: NarratedAction;
  sceneMutation?: SceneMutation;
  date: string;
  type: InworldPacketType;
}

export interface SceneMutation {
  name?: string;
  description?: string;
  displayName?: string;
  characterNames?: string[];
  loadedCharacters?: Character[];
  addedCharacters?: Character[];
}

export class InworldPacket {
  private type: InworldPacketType = InworldPacketType.UNKNOWN;

  readonly date: string;
  readonly packetId: PacketId;
  readonly routing: Routing;

  // Events
  readonly text: TextEvent;
  readonly audio: AudioEvent;
  readonly trigger: TriggerEvent;
  readonly control: ControlEvent;
  readonly emotions: EmotionEvent;
  readonly silence: SilenceEvent;
  readonly narratedAction: NarratedAction;
  readonly cancelResponses: CancelResponsesEvent;
  readonly sceneMutation: SceneMutation;

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

  isTrigger() {
    return this.type === InworldPacketType.TRIGGER;
  }

  isEmotion() {
    return this.type === InworldPacketType.EMOTION;
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

  shouldHaveConversationId() {
    return (
      this.isAudio() ||
      this.isText() ||
      this.isTrigger() ||
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
      ...(type === InworldPacketType.CANCEL_RESPONSE && {
        cancelResponses: CancelResponsesEvent.fromProto(proto.mutation),
      }),
      ...(type === InworldPacketType.NARRATED_ACTION && {
        narratedAction: NarratedAction.fromProto(proto.action),
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
            characterNames: proto.mutation.loadCharacters.name.map(
              (c: LoadCharactersCharacterName) => c.name,
            ),
          }),
          ...(proto.sessionControlResponse?.loadedScene && {
            loadedCharacters:
              proto.sessionControlResponse.loadedScene.agents.map(
                (agent: Agent) => Character.fromProto(agent),
              ),
            name: proto.sessionControlResponse.loadedScene.sceneName,
            description:
              proto.sessionControlResponse.loadedScene.sceneDescription,
            displayName:
              proto.sessionControlResponse.loadedScene.sceneDisplayName,
          }),
          ...(proto.sessionControlResponse?.loadedCharacters && {
            addedCharacters:
              proto.sessionControlResponse.loadedCharacters.agents.map(
                (agent: Agent) => Character.fromProto(agent),
              ),
          }),
        },
      }),
    });
  }

  private static getType(packet: ProtoPacket) {
    if (packet.text) {
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
    } else if (packet.custom) {
      return InworldPacketType.TRIGGER;
    } else if (packet.control) {
      return InworldPacketType.CONTROL;
    } else if (packet.emotion) {
      return InworldPacketType.EMOTION;
    } else if (packet.mutation?.cancelResponses) {
      return InworldPacketType.CANCEL_RESPONSE;
    } else if (packet.action?.narratedAction) {
      return InworldPacketType.NARRATED_ACTION;
    } else if (
      packet.sessionControlResponse?.loadedScene ||
      packet.sessionControlResponse?.loadedCharacters
    ) {
      return InworldPacketType.SCENE_MUTATION_RESPONSE;
    } else if (packet.mutation?.loadScene || packet.mutation?.loadCharacters) {
      return InworldPacketType.SCENE_MUTATION_REQUEST;
    } else {
      return InworldPacketType.UNKNOWN;
    }
  }
}
