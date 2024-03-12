import {
  LoadSceneResponse,
  LoadSceneResponseAgent,
} from '../../proto/ai/inworld/engine/world-engine.pb';
import { Character } from './character.entity';

export interface SceneProps {
  name: string;
  characters?: Character[];
}

export class Scene {
  name: string;
  characters: Character[];

  constructor(props: SceneProps) {
    this.name = props.name;
    this.characters = props.characters ?? [];
  }

  static fromProto(name: string, proto: LoadSceneResponse) {
    const characters = proto.agents.map((agent: LoadSceneResponseAgent) =>
      Character.fromProto(agent),
    );

    return new Scene({
      name,
      characters,
    });
  }
}
