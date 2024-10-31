import * as z from "zod";


export const PlaybackEnumSchema = z.enum([
    "INTERACTION",
    "INTERACTION_END",
    "UNSPECIFIED",
    "UTTERANCE",
]);
export type PlaybackEnum = z.infer<typeof PlaybackEnumSchema>;


export const TypeEnumSchema = z.enum([
    "TASK",
    "TRIGGER",
    "UNSPECIFIED",
]);
export type TypeEnum = z.infer<typeof TypeEnumSchema>;

export const ParameterSchema = z.object({
    "name": z.string().optional(),
    "value": z.string().optional(),
});
export type Parameter = z.infer<typeof ParameterSchema>;

export const CustomEventSchema = z.object({
    "name": z.string().optional(),
    "parameters": z.array(ParameterSchema).optional(),
    "playback": z.union([PlaybackEnumSchema, z.number()]).optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type CustomEvent = z.infer<typeof CustomEventSchema>;
