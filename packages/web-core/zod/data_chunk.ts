import * as z from "zod";


export const AudioFormatEnumSchema = z.enum([
    "AUDIO_MP3",
    "AUDIO_PCM_16000",
    "AUDIO_PCM_22050",
    "UNSPECIFIED_AUDIO_FORMAT",
]);
export type AudioFormatEnum = z.infer<typeof AudioFormatEnumSchema>;


export const DataTypeEnumSchema = z.enum([
    "AUDIO",
    "INSPECT",
    "NVIDIA_A2F_ANIMATION",
    "NVIDIA_A2F_ANIMATION_HEADER",
    "SILENCE",
    "STATE",
    "UNSPECIFIED",
]);
export type DataTypeEnum = z.infer<typeof DataTypeEnumSchema>;

export const AdditionalPhonemeInfoSchema = z.object({
    "phoneme": z.string().optional(),
    "start_offset": z.string().optional(),
});
export type AdditionalPhonemeInfo = z.infer<typeof AdditionalPhonemeInfoSchema>;

export const DataChunkSchema = z.object({
    "additional_phoneme_info": z.array(AdditionalPhonemeInfoSchema).optional(),
    "audioFormat": z.union([AudioFormatEnumSchema, z.number()]).optional(),
    "chunk": z.string().optional(),
    "duration_ms": z.string().optional(),
    "type": z.union([DataTypeEnumSchema, z.number()]).optional(),
});
export type DataChunk = z.infer<typeof DataChunkSchema>;
