import {
  Actor as ProtoActor,
  ActorType as ProtoActorType,
  Routing as ProtoRouting,
} from '../../../proto/ai/inworld/packets/packets.pb';

export class Actor {
  readonly name: string;
  readonly isPlayer: boolean;
  readonly isCharacter: boolean;

  constructor({
    name,
    isPlayer,
    isCharacter,
  }: {
    name: string;
    isPlayer: boolean;
    isCharacter: boolean;
  }) {
    this.name = name;
    this.isPlayer = isPlayer;
    this.isCharacter = isCharacter;
  }

  static fromProto(proto?: ProtoActor) {
    const type = proto?.type;

    return new Actor({
      name: proto?.name ?? '',
      isPlayer: type === ProtoActorType.PLAYER,
      isCharacter: type === ProtoActorType.AGENT,
    });
  }
}

export class Routing {
  readonly source: Actor;
  readonly targets: Actor[];

  constructor({ source, targets }: { source: Actor; targets: Actor[] }) {
    this.source = source;
    this.targets = targets;
  }

  static fromProto(proto?: ProtoRouting) {
    const targets = proto?.target?.type ? [proto.target] : proto?.targets ?? [];

    return new Routing({
      source: Actor.fromProto(proto?.source),
      targets: targets.map((target) => Actor.fromProto(target)),
    });
  }
}
