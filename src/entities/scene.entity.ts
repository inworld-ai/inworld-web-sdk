import { InworldPacket as ProtoPacket } from '../../proto/packets.pb';
import {
  LoadSceneResponse,
  LoadSceneResponseAgent,
  PreviousStateStateHolder as ProtoStateStateHolder,
} from '../../proto/world-engine.pb';
import { Character } from './character.entity';
import { InworldPacket } from './inworld_packet.entity';

export interface PreviousStateStateHolder {
  resourceName?: string;
  packets?: InworldPacket[];
}

export interface PreviousState {
  stateHolders?: PreviousStateStateHolder[];
}

export interface SceneProps {
  characters: Character[];
  key: string;
  previousState?: PreviousState;
}

export class Scene {
  readonly characters: Array<Character> = [];
  readonly key: string;
  readonly previousState: PreviousState;

  constructor(props: SceneProps) {
    this.characters = props.characters;
    this.key = props.key;
    this.previousState = props.previousState;
  }

  static fromProto(proto: LoadSceneResponse) {
    const characters = (proto.agents || [])?.map(
      (agent: LoadSceneResponseAgent) => Character.fromProto(agent),
    );

    const previousState = {
      stateHolders: (proto.previousState?.stateHolders || []).map(
        (stateHolder: ProtoStateStateHolder) => ({
          // Adopt inconsistent brain names formatting
          resourceName: `workspaces/${stateHolder.brainName!.replace(
            '__',
            '/characters/',
          )}`,
          packets: stateHolder.packets?.map((packet: ProtoPacket) =>
            InworldPacket.fromProto(packet),
          ),
        }),
      ),
    };

    return new Scene({
      key: proto.key,
      characters,
      previousState,
    });
  }
}
