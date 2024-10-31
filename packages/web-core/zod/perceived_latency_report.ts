import * as z from "zod";


export const PrecisionEnumSchema = z.enum([
    "ESTIMATED",
    "FINE",
    "NON_SPEECH",
    "PUSH_TO_TALK",
    "UNSPECIFIED",
]);
export type PrecisionEnum = z.infer<typeof PrecisionEnumSchema>;

export const PerceivedLatencyReportSchema = z.object({
    "latency": z.string().optional(),
    "precision": z.union([PrecisionEnumSchema, z.number()]).optional(),
});
export type PerceivedLatencyReport = z.infer<typeof PerceivedLatencyReportSchema>;
