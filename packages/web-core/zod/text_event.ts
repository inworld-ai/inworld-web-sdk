import * as z from "zod";


export const SourceTypeEnumSchema = z.enum([
    "FILLER",
    "FILLERS",
    "GENERATED",
    "SPEECH_TO_TEXT",
    "TYPED_IN",
    "UNKNOWN",
]);
export type SourceTypeEnum = z.infer<typeof SourceTypeEnumSchema>;

export const ModelInfoSchema = z.object({
    "model": z.string().optional(),
    "service": z.string().optional(),
});
export type ModelInfo = z.infer<typeof ModelInfoSchema>;

export const TextEventSchema = z.object({
    "final": z.boolean().optional(),
    "model_info": ModelInfoSchema.optional(),
    "source_type": z.union([SourceTypeEnumSchema, z.number()]).optional(),
    "text": z.string().optional(),
});
export type TextEvent = z.infer<typeof TextEventSchema>;
