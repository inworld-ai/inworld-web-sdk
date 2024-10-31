import * as z from "zod";


export const NarratedActionSchema = z.object({
    "content": z.string().optional(),
});
export type NarratedAction = z.infer<typeof NarratedActionSchema>;
