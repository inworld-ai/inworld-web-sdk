import {
  ItemsInEntitiesOperationType as ProtoItemsInEntitiesOperationType,
  ItemsOperationEvent as ProtoItemsOperationEvent,
} from '../../../proto/ai/inworld/packets/entities_packets.pb';
import { ItemsInEntitiesOperationType } from '../../common/data_structures';
import { EntityItem } from './entity_item';

export type CreateOrUpdateItemsOperation = {
  items?: EntityItem[];
  addToEntities?: string[];
};

export type RemoveItemsOperation = {
  itemIds?: string[];
};

export type ItemsInEntitiesOperation = {
  type?: ItemsInEntitiesOperationType;
  itemIds?: string[];
  entityNames?: string[];
};

export class ItemOperation {
  createOrUpdateItems: CreateOrUpdateItemsOperation | undefined;
  removeItems: RemoveItemsOperation | undefined;
  itemsInEntities: ItemsInEntitiesOperation | undefined;

  constructor({
    createOrUpdateItems,
    removeItems,
    itemsInEntities,
  }: {
    createOrUpdateItems?: CreateOrUpdateItemsOperation;
    removeItems?: RemoveItemsOperation;
    itemsInEntities?: ItemsInEntitiesOperation;
  }) {
    if (createOrUpdateItems) {
      this.createOrUpdateItems = createOrUpdateItems;
    }

    if (removeItems) {
      this.removeItems = removeItems;
    }

    if (itemsInEntities) {
      this.itemsInEntities = itemsInEntities;
    }
  }

  static fromProto(proto: ProtoItemsOperationEvent) {
    return new ItemOperation({
      createOrUpdateItems: {
        items: proto.createOrUpdateItems?.items?.map((item) =>
          EntityItem.fromProto(item),
        ),
        addToEntities: proto.createOrUpdateItems?.addToEntities,
      },
      removeItems: proto.removeItems,
      itemsInEntities: {
        type: this.convertOperationTypeFromProto(proto.itemsInEntities?.type),
        itemIds: proto.itemsInEntities?.itemIds,
        entityNames: proto.itemsInEntities?.entityNames,
      },
    });
  }

  toProto(): ProtoItemsOperationEvent {
    if (this.createOrUpdateItems) {
      return {
        createOrUpdateItems: {
          items:
            this.createOrUpdateItems.items?.map((item) => item.toProto()) || [],
          addToEntities: this.createOrUpdateItems.addToEntities,
        },
      };
    }

    if (this.removeItems) {
      return { removeItems: this.removeItems };
    }

    if (this.itemsInEntities) {
      return {
        itemsInEntities: {
          type: this.itemsInEntities.type
            ? ItemOperation.convertOperationTypeToProto(
                this.itemsInEntities.type,
              )
            : ProtoItemsInEntitiesOperationType.UNSPECIFIED,
          itemIds: this.itemsInEntities.itemIds,
          entityNames: this.itemsInEntities.entityNames,
        },
      };
    }
  }

  private static convertOperationTypeToProto(
    type: ItemsInEntitiesOperationType,
  ) {
    switch (type) {
      case ItemsInEntitiesOperationType.ADD:
        return ProtoItemsInEntitiesOperationType.ADD;
      case ItemsInEntitiesOperationType.REMOVE:
        return ProtoItemsInEntitiesOperationType.REMOVE;
      case ItemsInEntitiesOperationType.REPLACE:
        return ProtoItemsInEntitiesOperationType.REPLACE;
    }
  }

  private static convertOperationTypeFromProto(
    type: ProtoItemsInEntitiesOperationType,
  ) {
    switch (type) {
      case ProtoItemsInEntitiesOperationType.ADD:
        return ItemsInEntitiesOperationType.ADD;
      case ProtoItemsInEntitiesOperationType.REMOVE:
        return ItemsInEntitiesOperationType.REMOVE;
      case ProtoItemsInEntitiesOperationType.REPLACE:
        return ItemsInEntitiesOperationType.REPLACE;
    }
  }
}
