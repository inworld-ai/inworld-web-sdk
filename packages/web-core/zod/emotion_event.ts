import * as z from "zod";


export const SpaffCodeEnumSchema = z.enum([
    "AFFECTION",
    "ANGER",
    "BELLIGERENCE",
    "CONTEMPT",
    "CRITICISM",
    "DEFENSIVENESS",
    "DISGUST",
    "DOMINEERING",
    "HUMOR",
    "INTEREST",
    "JOY",
    "NEUTRAL",
    "SADNESS",
    "STONEWALLING",
    "SURPRISE",
    "TENSE_HUMOR",
    "TENSION",
    "VALIDATION",
    "WHINING",
]);
export type SpaffCodeEnum = z.infer<typeof SpaffCodeEnumSchema>;


export const StrengthEnumSchema = z.enum([
    "NORMAL",
    "STRONG",
    "UNSPECIFIED",
    "WEAK",
]);
export type StrengthEnum = z.infer<typeof StrengthEnumSchema>;

export const EmotionEventSchema = z.object({
    "behavior": z.union([SpaffCodeEnumSchema, z.number()]).optional(),
    "fear": z.number().optional(),
    "joy": z.number().optional(),
    "strength": z.union([StrengthEnumSchema, z.number()]).optional(),
    "surprise": z.number().optional(),
    "trust": z.number().optional(),
});
export type EmotionEvent = z.infer<typeof EmotionEventSchema>;
