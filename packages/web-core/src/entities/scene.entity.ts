import {
  ActorType,
  Agent,
  CurrentSceneStatus,
  InworldPacket as ProtoPacket,
  SessionHistoryResponse,
} from '../../proto/ai/inworld/packets/packets.pb';
import { SCENE_PATTERN } from '../common/constants';
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
    sceneStatus,
    sessionHistory,
  }: {
    sceneStatus: CurrentSceneStatus;
    sessionHistory?: SessionHistoryResponse;
  }) {
    const characters = (sceneStatus.agents ?? []).map((agent: Agent) =>
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

    // FIXME: Server send wrong scene name in case of characer resource name is used as scene name
    const name = SCENE_PATTERN.test(sceneStatus.sceneName)
      ? sceneStatus.sceneName
      : characters[0]?.resourceName ?? '';

    return new Scene({
      name,
      description: sceneStatus.sceneDescription,
      displayName: sceneStatus.sceneDisplayName,
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
