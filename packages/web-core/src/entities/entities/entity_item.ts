import { EntityItem as ProtoEntityItem } from '../../../proto/ai/inworld/packets/entities_packets.pb';
import { EntityItemProps } from '../../common/data_structures';

export class EntityItem {
  readonly id: string;
  readonly displayName: string | undefined;
  readonly description: string | undefined;
  readonly properties: { [key: string]: string } | undefined;

  constructor({ id, displayName, description, properties }: EntityItemProps) {
    this.id = id;

    if (displayName) {
      this.displayName = displayName;
    }

    if (description) {
      this.description = description;
    }

    if (properties) {
      this.properties = properties;
    }
  }

  static fromProto(proto: ProtoEntityItem) {
    return new EntityItem({
      id: proto.id,
      displayName: proto.displayName,
      description: proto.description,
      properties: proto.properties,
    });
  }

  toProto(): ProtoEntityItem {
    return {
      id: this.id,
      displayName: this.displayName,
      description: this.description,
      properties: this.properties,
    };
  }
}
