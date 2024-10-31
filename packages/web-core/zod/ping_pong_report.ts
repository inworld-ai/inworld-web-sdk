import * as z from "zod";


export const TypeEnumSchema = z.enum([
    "PING",
    "PONG",
    "UNSPECIFIED",
]);
export type TypeEnum = z.infer<typeof TypeEnumSchema>;

export const PacketIdSchema = z.object({
    "conversation_id": z.string().optional(),
    "correlation_id": z.string().optional(),
    "interaction_id": z.string().optional(),
    "packet_id": z.string().optional(),
    "utterance_id": z.string().optional(),
});
export type PacketId = z.infer<typeof PacketIdSchema>;

export const PingPongReportSchema = z.object({
    "ping_packet_id": PacketIdSchema.optional(),
    "ping_timestamp": z.coerce.date().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type PingPongReport = z.infer<typeof PingPongReportSchema>;
