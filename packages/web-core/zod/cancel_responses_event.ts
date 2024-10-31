import * as z from "zod";


export const CancelResponsesEventSchema = z.object({
    "interaction_id": z.string().optional(),
    "utterance_id": z.array(z.string()).optional(),
});
export type CancelResponsesEvent = z.infer<typeof CancelResponsesEventSchema>;
