import {
  ActorType,
  Agent,
  InworldPacket as ProtoPacket,
  LoadedScene,
  SessionHistoryResponse,
} from '../../proto/ai/inworld/packets/packets.pb';
import { Character } from './character.entity';

export interface SceneProps {
  name: string;
  characters?: Character[];
  description?: string;
  displayName?: string;
  history?: ProtoPacket[];
}

export class Scene {
  name: string;
  characters: Character[];
  description: string;
  displayName: string;
  history: ProtoPacket[];

  constructor(props: SceneProps) {
    this.name = props.name;
    this.characters = props.characters ?? [];
    this.description = props.description ?? '';
    this.displayName = props.displayName ?? '';
    this.history = props.history ?? [];
  }

  static fromProto({
    name,
    loadedScene,
    sessionHistory,
  }: {
    name: string;
    loadedScene?: LoadedScene;
    sessionHistory?: SessionHistoryResponse;
  }) {
    const characters = (loadedScene?.agents ?? []).map((agent: Agent) =>
      Character.fromProto(agent),
    );

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
                        name: item.agent?.agentId ?? packet.routing.source.name,
                      }),
                    },
                    ...(packet.routing.target && {
                      target: {
                        ...packet.routing.target,
                        ...(packet.routing.target.type === ActorType.AGENT && {
                          name:
                            item.agent?.agentId ?? packet.routing.target.name,
                        }),
                      },
                    }),
                    ...(packet.routing.targets?.length && {
                      targets: packet.routing.targets.map((target) => {
                        return {
                          ...target,
                          ...(target.type === ActorType.AGENT && {
                            name: item.agent?.agentId ?? target.name,
                          }),
                        };
                      }),
                    }),
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
      name,
      description: loadedScene?.sceneDescription,
      displayName: loadedScene?.sceneDisplayName,
      characters,
      history,
    });
  }

  getCharactersByIds(ids: string[]) {
    return this.characters.filter((c) => ids.includes(c.id));
  }

  getCharactersByResourceNames(names: string[]) {
    return this.characters.filter((c) => names.includes(c.resourceName));
  }
}
