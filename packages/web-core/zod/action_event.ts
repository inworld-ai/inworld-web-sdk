import * as z from "zod";


export const PlaybackEnumSchema = z.enum([
    "INTERACTION",
    "INTERACTION_END",
    "UNSPECIFIED",
    "UTTERANCE",
]);
export type PlaybackEnum = z.infer<typeof PlaybackEnumSchema>;

export const NarratedActionSchema = z.object({
    "content": z.string().optional(),
});
export type NarratedAction = z.infer<typeof NarratedActionSchema>;

export const ActionEventSchema = z.object({
    "narrated_action": NarratedActionSchema.optional(),
    "playback": z.union([PlaybackEnumSchema, z.number()]).optional(),
});
export type ActionEvent = z.infer<typeof ActionEventSchema>;
