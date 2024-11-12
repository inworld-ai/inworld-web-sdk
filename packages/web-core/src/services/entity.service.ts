import {
  EntityItemProps,
  ItemsInEntitiesOperationType,
} from '../common/data_structures';
import { EntityItem } from '../entities/entities/entity_item';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { ConnectionService } from './connection.service';

export class EntityService<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private connection: ConnectionService<InworldPacketT>;

  constructor(connection: ConnectionService<InworldPacketT>) {
    this.connection = connection;
  }

  async createOrUpdateItems(props: {
    items: EntityItemProps[];
    addToEntities: string[];
  }) {
    return this.connection.send(() =>
      this.connection.getEventFactory().createOrUpdateItems({
        items: props.items.map((item) => new EntityItem(item)),
        addToEntities: props.addToEntities,
      }),
    );
  }

  async removeItems(ids: string[]) {
    return this.connection.send(() =>
      this.connection.getEventFactory().removeItems(ids),
    );
  }

  async itemsInEntities(props: {
    type: ItemsInEntitiesOperationType;
    itemIds: string[];
    entityNames: string[];
  }) {
    return this.connection.send(() =>
      this.connection.getEventFactory().itemsInEntities(props),
    );
  }
}
