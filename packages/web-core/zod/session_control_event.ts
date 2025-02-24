import * as z from "zod";


export const ContinuationTypeEnumSchema = z.enum([
    "CONTINUATION_TYPE_DIALOG_HISTORY",
    "CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE",
    "CONTINUATION_TYPE_UNKNOWN",
]);
export type ContinuationTypeEnum = z.infer<typeof ContinuationTypeEnumSchema>;


export const TypeEnumSchema = z.enum([
    "AGENT",
    "PLAYER",
    "UNKNOWN",
    "WORLD",
]);
export type TypeEnum = z.infer<typeof TypeEnumSchema>;

export const SessionControlEventCapabilitiesConfigurationSchema = z.object({
    "audio": z.boolean().optional(),
    "audio2face": z.boolean().optional(),
    "continuation": z.boolean().optional(),
    "debug_info": z.boolean().optional(),
    "emotion_streaming": z.boolean().optional(),
    "emotions": z.boolean().optional(),
    "inspect": z.boolean().optional(),
    "interruptions": z.boolean().optional(),
    "logs": z.boolean().optional(),
    "logs_debug": z.boolean().optional(),
    "logs_info": z.boolean().optional(),
    "logs_internal": z.boolean().optional(),
    "logs_warning": z.boolean().optional(),
    "multi_agent": z.boolean().optional(),
    "multi_modal_action_planning": z.boolean().optional(),
    "narrated_actions": z.boolean().optional(),
    "perceived_latency_report": z.boolean().optional(),
    "phoneme_info": z.boolean().optional(),
    "ping_pong_report": z.boolean().optional(),
    "regenerate_response": z.boolean().optional(),
    "relations": z.boolean().optional(),
    "session_cancellation": z.boolean().optional(),
    "silence_events": z.boolean().optional(),
    "tts_mp3": z.boolean().optional(),
    "tts_streaming": z.boolean().optional(),
    "turn_based_stt": z.boolean().optional(),
});
export type SessionControlEventCapabilitiesConfiguration = z.infer<typeof SessionControlEventCapabilitiesConfigurationSchema>;

export const SessionControlEventClientConfigurationSchema = z.object({
    "description": z.string().optional(),
    "id": z.string().optional(),
    "version": z.string().optional(),
});
export type SessionControlEventClientConfiguration = z.infer<typeof SessionControlEventClientConfigurationSchema>;

export const ContinuationInfoSchema = z.object({
    "passed_time": z.coerce.date().optional(),
});
export type ContinuationInfo = z.infer<typeof ContinuationInfoSchema>;

export const ActorSchema = z.object({
    "name": z.string().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type Actor = z.infer<typeof ActorSchema>;

export const SessionControlEventSessionConfigurationSchema = z.object({
    "game_session_id": z.string().optional(),
});
export type SessionControlEventSessionConfiguration = z.infer<typeof SessionControlEventSessionConfigurationSchema>;

export const SessionConfigurationPayloadCapabilitiesConfigurationSchema = z.object({
    "audio": z.boolean().optional(),
    "audio2face": z.boolean().optional(),
    "continuation": z.boolean().optional(),
    "debug_info": z.boolean().optional(),
    "emotion_streaming": z.boolean().optional(),
    "emotions": z.boolean().optional(),
    "inspect": z.boolean().optional(),
    "interruptions": z.boolean().optional(),
    "logs": z.boolean().optional(),
    "logs_debug": z.boolean().optional(),
    "logs_info": z.boolean().optional(),
    "logs_internal": z.boolean().optional(),
    "logs_warning": z.boolean().optional(),
    "multi_agent": z.boolean().optional(),
    "multi_modal_action_planning": z.boolean().optional(),
    "narrated_actions": z.boolean().optional(),
    "perceived_latency_report": z.boolean().optional(),
    "phoneme_info": z.boolean().optional(),
    "ping_pong_report": z.boolean().optional(),
    "regenerate_response": z.boolean().optional(),
    "relations": z.boolean().optional(),
    "session_cancellation": z.boolean().optional(),
    "silence_events": z.boolean().optional(),
    "tts_mp3": z.boolean().optional(),
    "tts_streaming": z.boolean().optional(),
    "turn_based_stt": z.boolean().optional(),
});
export type SessionConfigurationPayloadCapabilitiesConfiguration = z.infer<typeof SessionConfigurationPayloadCapabilitiesConfigurationSchema>;

export const SessionConfigurationPayloadClientConfigurationSchema = z.object({
    "description": z.string().optional(),
    "id": z.string().optional(),
    "version": z.string().optional(),
});
export type SessionConfigurationPayloadClientConfiguration = z.infer<typeof SessionConfigurationPayloadClientConfigurationSchema>;

export const SessionConfigurationPayloadSessionConfigurationSchema = z.object({
    "game_session_id": z.string().optional(),
});
export type SessionConfigurationPayloadSessionConfiguration = z.infer<typeof SessionConfigurationPayloadSessionConfigurationSchema>;

export const PlayerFieldSchema = z.object({
    "field_id": z.string().optional(),
    "field_value": z.string().optional(),
});
export type PlayerField = z.infer<typeof PlayerFieldSchema>;

export const HistoryItemSchema = z.object({
    "actor": ActorSchema.optional(),
    "text": z.string().optional(),
});
export type HistoryItem = z.infer<typeof HistoryItemSchema>;

export const PlayerProfileSchema = z.object({
    "fields": z.array(PlayerFieldSchema).optional(),
});
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;

export const DialogHistorySchema = z.object({
    "history": z.array(HistoryItemSchema).optional(),
});
export type DialogHistory = z.infer<typeof DialogHistorySchema>;

export const SessionConfigurationPayloadContinuationSchema = z.object({
    "continuation_info": ContinuationInfoSchema.optional(),
    "continuation_type": z.union([ContinuationTypeEnumSchema, z.number()]).optional(),
    "dialog_history": DialogHistorySchema.optional(),
    "externally_saved_state": z.string().optional(),
});
export type SessionConfigurationPayloadContinuation = z.infer<typeof SessionConfigurationPayloadContinuationSchema>;

export const UserSettingsSchema = z.object({
    "player_profile": PlayerProfileSchema.optional(),
    "view_transcript_consent": z.boolean().optional(),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const SessionControlEventUserConfigurationSchema = z.object({
    "id": z.string().optional(),
    "name": z.string().optional(),
    "user_settings": UserSettingsSchema.optional(),
});
export type SessionControlEventUserConfiguration = z.infer<typeof SessionControlEventUserConfigurationSchema>;

export const SessionControlEventContinuationSchema = z.object({
    "continuation_info": ContinuationInfoSchema.optional(),
    "continuation_type": z.union([ContinuationTypeEnumSchema, z.number()]).optional(),
    "dialog_history": DialogHistorySchema.optional(),
    "externally_saved_state": z.string().optional(),
});
export type SessionControlEventContinuation = z.infer<typeof SessionControlEventContinuationSchema>;

export const SessionConfigurationPayloadUserConfigurationSchema = z.object({
    "id": z.string().optional(),
    "name": z.string().optional(),
    "user_settings": UserSettingsSchema.optional(),
});
export type SessionConfigurationPayloadUserConfiguration = z.infer<typeof SessionConfigurationPayloadUserConfigurationSchema>;

export const SessionConfigurationPayloadSchema = z.object({
    "capabilities_configuration": SessionConfigurationPayloadCapabilitiesConfigurationSchema.optional(),
    "client_configuration": SessionConfigurationPayloadClientConfigurationSchema.optional(),
    "continuation": SessionConfigurationPayloadContinuationSchema.optional(),
    "session_configuration": SessionConfigurationPayloadSessionConfigurationSchema.optional(),
    "user_configuration": SessionConfigurationPayloadUserConfigurationSchema.optional(),
});
export type SessionConfigurationPayload = z.infer<typeof SessionConfigurationPayloadSchema>;

export const SessionControlEventSchema = z.object({
    "capabilities_configuration": SessionControlEventCapabilitiesConfigurationSchema.optional(),
    "client_configuration": SessionControlEventClientConfigurationSchema.optional(),
    "continuation": SessionControlEventContinuationSchema.optional(),
    "session_configuration": SessionControlEventSessionConfigurationSchema.optional(),
    "session_configuration_payload": SessionConfigurationPayloadSchema.optional(),
    "session_history_request": z.record(z.string(), z.any()).optional(),
    "user_configuration": SessionControlEventUserConfigurationSchema.optional(),
});
export type SessionControlEvent = z.infer<typeof SessionControlEventSchema>;
