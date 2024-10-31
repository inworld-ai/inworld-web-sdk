import * as z from "zod";


export const PrecisionEnumSchema = z.enum([
    "ESTIMATED",
    "FINE",
    "NON_SPEECH",
    "PUSH_TO_TALK",
    "UNSPECIFIED",
]);
export type PrecisionEnum = z.infer<typeof PrecisionEnumSchema>;


export const TypeEnumSchema = z.enum([
    "PING",
    "PONG",
    "UNSPECIFIED",
]);
export type TypeEnum = z.infer<typeof TypeEnumSchema>;

export const PerceivedLatencySchema = z.object({
    "latency": z.string().optional(),
    "precision": z.union([PrecisionEnumSchema, z.number()]).optional(),
});
export type PerceivedLatency = z.infer<typeof PerceivedLatencySchema>;

export const PacketIdSchema = z.object({
    "conversation_id": z.string().optional(),
    "correlation_id": z.string().optional(),
    "interaction_id": z.string().optional(),
    "packet_id": z.string().optional(),
    "utterance_id": z.string().optional(),
});
export type PacketId = z.infer<typeof PacketIdSchema>;

export const PingPongSchema = z.object({
    "ping_packet_id": PacketIdSchema.optional(),
    "ping_timestamp": z.coerce.date().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type PingPong = z.infer<typeof PingPongSchema>;

export const LatencyReportEventSchema = z.object({
    "perceived_latency": PerceivedLatencySchema.optional(),
    "ping_pong": PingPongSchema.optional(),
});
export type LatencyReportEvent = z.infer<typeof LatencyReportEventSchema>;
