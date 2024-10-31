import * as z from "zod";


export const TypeEnumSchema = z.enum([
    "AGENT",
    "PLAYER",
    "UNKNOWN",
    "WORLD",
]);
export type TypeEnum = z.infer<typeof TypeEnumSchema>;

export const SourceSchema = z.object({
    "name": z.string().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const TargetSchema = z.object({
    "name": z.string().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type Target = z.infer<typeof TargetSchema>;

export const ActorSchema = z.object({
    "name": z.string().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type Actor = z.infer<typeof ActorSchema>;

export const RoutingSchema = z.object({
    "source": SourceSchema.optional(),
    "target": TargetSchema.optional(),
    "targets": z.array(ActorSchema).optional(),
});
export type Routing = z.infer<typeof RoutingSchema>;
