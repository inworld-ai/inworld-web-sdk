import {
  ActorType,
  Agent,
  ControlEventAction,
  InworldPacket as ProtoPacket,
  LoadedScene,
  SessionHistoryResponse,
} from '../../proto/ai/inworld/packets/packets.pb';
import { Character } from './character.entity';

export interface SceneProps {
  name: string;
  characters?: Character[];
  history?: ProtoPacket[];
}

export class Scene {
  name: string;
  characters: Character[];
  history: ProtoPacket[];

  constructor(props: SceneProps) {
    this.name = props.name;
    this.characters = props.characters ?? [];
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

    // This is to ensure that the scene is in a consistent state.
    // Interaction end means that all historical interactions are finished.
    if (
      history.length &&
      history[history.length - 1].control?.action !==
        ControlEventAction.INTERACTION_END
    ) {
      const lastPacket = history[history.length - 1];
      history.push({
        packetId: {
          interactionId: lastPacket.packetId?.interactionId,
        },
        control: {
          action: ControlEventAction.INTERACTION_END,
        },
        routing: { ...lastPacket.routing },
        timestamp: lastPacket.timestamp,
      });
    }

    return new Scene({
      name,
      characters,
      history,
    });
  }
}
