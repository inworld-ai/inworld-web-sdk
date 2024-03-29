import { Agent } from '../../proto/ai/inworld/packets/packets.pb';

export interface CharacterProps {
  id: string;
  resourceName: string;
  displayName: string;
  assets: Assets;
}

export interface Assets {
  avatarImg?: string;
  avatarImgOriginal?: string;
  rpmModelUri?: string;
  rpmImageUriPortrait?: string;
  rpmImageUriPosture?: string;
}

export class Character {
  readonly id: string;
  readonly resourceName: string;
  readonly displayName: string;
  readonly assets: Assets;

  constructor(props: CharacterProps) {
    this.id = props.id;
    this.resourceName = props.resourceName;
    this.displayName = props.displayName;
    this.assets = props.assets;
  }

  static fromProto(proto: Agent) {
    const assets = proto.characterAssets;

    return new Character({
      id: proto.agentId,
      resourceName: proto.brainName,
      displayName: proto.givenName,
      assets: {
        avatarImg: assets?.avatarImg,
        avatarImgOriginal: assets?.avatarImgOriginal,
        rpmModelUri: assets?.rpmModelUri,
        rpmImageUriPortrait: assets?.rpmImageUriPortrait,
        rpmImageUriPosture: assets?.rpmImageUriPosture,
      },
    });
  }
}
