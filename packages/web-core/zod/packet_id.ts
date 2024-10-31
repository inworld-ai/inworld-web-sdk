import * as z from "zod";


export const PacketIdSchema = z.object({
    "conversation_id": z.string().optional(),
    "correlation_id": z.string().optional(),
    "interaction_id": z.string().optional(),
    "packet_id": z.string().optional(),
    "utterance_id": z.string().optional(),
});
export type PacketId = z.infer<typeof PacketIdSchema>;
