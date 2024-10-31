import * as z from "zod";


export const ActionEnumSchema = z.enum([
    "AUDIO_SESSION_END",
    "AUDIO_SESSION_START",
    "CONVERSATION_EVENT",
    "CONVERSATION_START",
    "CONVERSATION_STARTED",
    "CONVERSATION_UPDATE",
    "CURRENT_SCENE_STATUS",
    "INTERACTION_END",
    "SESSION_CONFIGURATION",
    "SESSION_END",
    "TTS_PLAYBACK_END",
    "TTS_PLAYBACK_MUTE",
    "TTS_PLAYBACK_START",
    "TTS_PLAYBACK_UNMUTE",
    "UNKNOWN",
    "WARNING",
]);
export type ActionEnum = z.infer<typeof ActionEnumSchema>;


export const MicrophoneModeEnumSchema = z.enum([
    "EXPECT_AUDIO_END",
    "OPEN_MIC",
    "UNSPECIFIED",
]);
export type MicrophoneModeEnum = z.infer<typeof MicrophoneModeEnumSchema>;


export const UnderstandingModeEnumSchema = z.enum([
    "FULL",
    "SPEECH_RECOGNITION_ONLY",
    "UNSPECIFIED_UNDERSTANDING_MODE",
]);
export type UnderstandingModeEnum = z.infer<typeof UnderstandingModeEnumSchema>;


export const ConversationEventTypeEnumSchema = z.enum([
    "EVICTED",
    "STARTED",
    "UNKNOWN",
    "UPDATED",
]);
export type ConversationEventTypeEnum = z.infer<typeof ConversationEventTypeEnumSchema>;


export const TypeEnumSchema = z.enum([
    "AGENT",
    "PLAYER",
    "UNKNOWN",
    "WORLD",
]);
export type TypeEnum = z.infer<typeof TypeEnumSchema>;


export const ContinuationTypeEnumSchema = z.enum([
    "CONTINUATION_TYPE_DIALOG_HISTORY",
    "CONTINUATION_TYPE_EXTERNALLY_SAVED_STATE",
    "CONTINUATION_TYPE_UNKNOWN",
]);
export type ContinuationTypeEnum = z.infer<typeof ContinuationTypeEnumSchema>;

export const AudioSessionStartSchema = z.object({
    "mode": z.union([MicrophoneModeEnumSchema, z.number()]).optional(),
    "understanding_mode": z.union([UnderstandingModeEnumSchema, z.number()]).optional(),
});
export type AudioSessionStart = z.infer<typeof AudioSessionStartSchema>;

export const ActorSchema = z.object({
    "name": z.string().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type Actor = z.infer<typeof ActorSchema>;

export const ConSchema = z.object({
    "participants": z.array(ActorSchema).optional(),
});
export type Con = z.infer<typeof ConSchema>;

export const CharacterAssetsSchema = z.object({
    "avatar_img": z.string().optional(),
    "avatar_img_original": z.string().optional(),
    "rpm_image_uri_portrait": z.string().optional(),
    "rpm_image_uri_posture": z.string().optional(),
    "rpm_model_uri": z.string().optional(),
});
export type CharacterAssets = z.infer<typeof CharacterAssetsSchema>;

export const CapabilitiesConfigurationSchema = z.object({
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
    "turn_based_stt": z.boolean().optional(),
});
export type CapabilitiesConfiguration = z.infer<typeof CapabilitiesConfigurationSchema>;

export const ClientConfigurationSchema = z.object({
    "description": z.string().optional(),
    "id": z.string().optional(),
    "version": z.string().optional(),
});
export type ClientConfiguration = z.infer<typeof ClientConfigurationSchema>;

export const ContinuationInfoSchema = z.object({
    "passed_time": z.coerce.date().optional(),
});
export type ContinuationInfo = z.infer<typeof ContinuationInfoSchema>;

export const ActorClassSchema = z.object({
    "name": z.string().optional(),
    "type": z.union([TypeEnumSchema, z.number()]).optional(),
});
export type ActorClass = z.infer<typeof ActorClassSchema>;

export const SessionConfigurationSessionConfigurationSchema = z.object({
    "game_session_id": z.string().optional(),
});
export type SessionConfigurationSessionConfiguration = z.infer<typeof SessionConfigurationSessionConfigurationSchema>;

export const PlayerFieldSchema = z.object({
    "field_id": z.string().optional(),
    "field_value": z.string().optional(),
});
export type PlayerField = z.infer<typeof PlayerFieldSchema>;

export const ConversationEventSchema = z.object({
    "event_type": z.union([ConversationEventTypeEnumSchema, z.number()]).optional(),
    "participants": z.array(ActorSchema).optional(),
});
export type ConversationEvent = z.infer<typeof ConversationEventSchema>;

export const AgentSchema = z.object({
    "agent_id": z.string().optional(),
    "brain_name": z.string().optional(),
    "character_assets": CharacterAssetsSchema.optional(),
    "given_name": z.string().optional(),
});
export type Agent = z.infer<typeof AgentSchema>;

export const HistoryItemSchema = z.object({
    "actor": ActorClassSchema.optional(),
    "text": z.string().optional(),
});
export type HistoryItem = z.infer<typeof HistoryItemSchema>;

export const PlayerProfileSchema = z.object({
    "fields": z.array(PlayerFieldSchema).optional(),
});
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;

export const CurrentSceneStatusSchema = z.object({
    "agents": z.array(AgentSchema).optional(),
    "scene_description": z.string().optional(),
    "scene_display_name": z.string().optional(),
    "scene_name": z.string().optional(),
});
export type CurrentSceneStatus = z.infer<typeof CurrentSceneStatusSchema>;

export const DialogHistorySchema = z.object({
    "history": z.array(HistoryItemSchema).optional(),
});
export type DialogHistory = z.infer<typeof DialogHistorySchema>;

export const UserSettingsSchema = z.object({
    "player_profile": PlayerProfileSchema.optional(),
    "view_transcript_consent": z.boolean().optional(),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const ContinuationSchema = z.object({
    "continuation_info": ContinuationInfoSchema.optional(),
    "continuation_type": z.union([ContinuationTypeEnumSchema, z.number()]).optional(),
    "dialog_history": DialogHistorySchema.optional(),
    "externally_saved_state": z.string().optional(),
});
export type Continuation = z.infer<typeof ContinuationSchema>;

export const UserConfigurationSchema = z.object({
    "id": z.string().optional(),
    "name": z.string().optional(),
    "user_settings": UserSettingsSchema.optional(),
});
export type UserConfiguration = z.infer<typeof UserConfigurationSchema>;

export const ControlEventSessionConfigurationSchema = z.object({
    "capabilities_configuration": CapabilitiesConfigurationSchema.optional(),
    "client_configuration": ClientConfigurationSchema.optional(),
    "continuation": ContinuationSchema.optional(),
    "session_configuration": SessionConfigurationSessionConfigurationSchema.optional(),
    "user_configuration": UserConfigurationSchema.optional(),
});
export type ControlEventSessionConfiguration = z.infer<typeof ControlEventSessionConfigurationSchema>;

export const ControlEventSchema = z.object({
    "action": z.union([ActionEnumSchema, z.number()]).optional(),
    "audio_session_start": AudioSessionStartSchema.optional(),
    "conversation_event": ConversationEventSchema.optional(),
    "conversation_update": ConSchema.optional(),
    "current_scene_status": CurrentSceneStatusSchema.optional(),
    "description": z.string().optional(),
    "payload": z.record(z.string(), z.any()).optional(),
    "session_configuration": ControlEventSessionConfigurationSchema.optional(),
});
export type ControlEvent = z.infer<typeof ControlEventSchema>;
