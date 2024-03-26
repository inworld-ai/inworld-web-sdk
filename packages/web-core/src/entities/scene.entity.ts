import {
  ActorType,
  Agent,
  InworldPacket as ProtoPacket,
  SessionControlResponseEvent,
} from '../../proto/ai/inworld/packets/packets.pb';
import { Character } from './character.entity';

export interface SceneProps {
  characters: Character[];
  history?: ProtoPacket[];
}

export class Scene {
  characters: Character[] = [];
  history: ProtoPacket[] = [];

  constructor(props: SceneProps) {
    this.characters = props.characters;
    this.history = props.history ?? [];
  }

  static serialize(scene: Scene) {
    return JSON.stringify(scene);
  }

  static deserialize(json: string) {
    try {
      const { characters } = JSON.parse(json) as SceneProps;

      return new Scene({ characters });
    } catch (e) {}
  }

  static fromProto({
    loadedScene,
    sessionHistory,
  }: SessionControlResponseEvent) {
    const characters = (loadedScene?.agents ?? []).map((agent: Agent) => {
      return new Character({
        id: agent.agentId,
        resourceName: agent.brainName,
        displayName: agent.givenName,
        assets: {
          avatarImg: agent.characterAssets.avatarImg,
          avatarImgOriginal: agent.characterAssets.avatarImgOriginal,
          rpmModelUri: agent.characterAssets.rpmModelUri,
          rpmImageUriPortrait: agent.characterAssets.rpmImageUriPortrait,
          rpmImageUriPosture: agent.characterAssets.rpmImageUriPosture,
        },
      });
    });

    const history =
      sessionHistory?.sessionHistoryItems?.reduce(
        (acc: ProtoPacket[], item) => {
          if (item.packets?.length) {
            acc.push(
              ...item.packets.map((packet) => {
                return {
                  ...packet,
                  routing: {
                    ...packet.routing,
                    source: {
                      ...packet.routing.source,
                      ...(packet.routing.source.type === ActorType.AGENT && {
                        name: item.agent?.agentId,
                      }),
                    },
                    target: {
                      ...packet.routing.target,
                      ...(packet.routing.target.type === ActorType.AGENT && {
                        name: item.agent?.agentId,
                      }),
                    },
                  },
                };
              }),
            );
          }

          return acc;
        },
        [],
      ) ?? [];

    return new Scene({
      characters,
      history,
    });
  }
}
