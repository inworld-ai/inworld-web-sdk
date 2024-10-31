import * as z from "zod";


export const TypeEnumSchema = z.enum([
    "ADD",
    "REMOVE",
    "REPLACE",
    "UNSPECIFIED",
]);
export type TypeEnum = z.infer<typeof TypeEnumSchema>;

export const EntityItemSchema = z.object({
    "description": z.string().optional(),
    "display_name": z.string().optional(),
    "id": z.string().optional(),
    "properties": z.record(z.string(), z.string()).optional(),
});
export type EntityItem = z.infer<typeof EntityItemSchema>;

export const ItemsInEntitiesSchema = z.object({
    "entity_names": z.array(z.string()).optional(),
    "item_ids": z.array(z.string()).optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type ItemsInEntities = z.infer<typeof ItemsInEntitiesSchema>;

export const RemoveItemsSchema = z.object({
    "item_ids": z.array(z.string()).optional(),
});
export type RemoveItems = z.infer<typeof RemoveItemsSchema>;

export const CreateOrUpdateItemsSchema = z.object({
    "add_to_entities": z.array(z.string()).optional(),
    "items": z.array(EntityItemSchema).optional(),
});
export type CreateOrUpdateItems = z.infer<typeof CreateOrUpdateItemsSchema>;

export const ItemsOperationEventSchema = z.object({
    "create_or_update_items": CreateOrUpdateItemsSchema.optional(),
    "items_in_entities": ItemsInEntitiesSchema.optional(),
    "remove_items": RemoveItemsSchema.optional(),
});
export type ItemsOperationEvent = z.infer<typeof ItemsOperationEventSchema>;
