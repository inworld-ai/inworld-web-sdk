import * as z from "zod";


export const ApplyResponseTypeEnumSchema = z.enum([
    "APPLY_RESPONSE_TYPE_COMMIT",
    "APPLY_RESPONSE_TYPE_DEFAULT",
]);
export type ApplyResponseTypeEnum = z.infer<typeof ApplyResponseTypeEnumSchema>;


export const LanguageCodeEnumSchema = z.enum([
    "AUTO",
    "EN_US",
    "JA_JP",
    "KO_KR",
    "LANGUAGE_CODE_UNSPECIFIED",
    "RU_RU",
    "ZH_CN",
]);
export type LanguageCodeEnum = z.infer<typeof LanguageCodeEnumSchema>;

export const PacketIdSchema = z.object({
    "conversation_id": z.string().optional(),
    "correlation_id": z.string().optional(),
    "interaction_id": z.string().optional(),
    "packet_id": z.string().optional(),
    "utterance_id": z.string().optional(),
});
export type PacketId = z.infer<typeof PacketIdSchema>;

export const CancelResponsesSchema = z.object({
    "interaction_id": z.string().optional(),
    "utterance_id": z.array(z.string()).optional(),
});
export type CancelResponses = z.infer<typeof CancelResponsesSchema>;

export const CharacterNameSchema = z.object({
    "language_code": z.union([LanguageCodeEnumSchema, z.number()]).optional(),
    "name": z.string().optional(),
});
export type CharacterName = z.infer<typeof CharacterNameSchema>;

export const LoadSceneSchema = z.object({
    "is_reset_scene": z.boolean().optional(),
    "name": z.string().optional(),
});
export type LoadScene = z.infer<typeof LoadSceneSchema>;

export const ModifyExactResponseSchema = z.object({
    "exact_text": z.string().optional(),
    "interaction_id": z.string().optional(),
});
export type ModifyExactResponse = z.infer<typeof ModifyExactResponseSchema>;

export const RegenerateResponseSchema = z.object({
    "interaction_id": z.string().optional(),
});
export type RegenerateResponse = z.infer<typeof RegenerateResponseSchema>;

export const CharacterAssetsSchema = z.object({
    "avatar_img": z.string().optional(),
    "avatar_img_original": z.string().optional(),
    "rpm_image_uri_portrait": z.string().optional(),
    "rpm_image_uri_posture": z.string().optional(),
    "rpm_model_uri": z.string().optional(),
});
export type CharacterAssets = z.infer<typeof CharacterAssetsSchema>;

export const ApplyResponseSchema = z.object({
    "apply_response_type": z.union([ApplyResponseTypeEnumSchema, z.number()]).optional(),
    "packet_id": PacketIdSchema.optional(),
});
export type ApplyResponse = z.infer<typeof ApplyResponseSchema>;

export const LoadCharactersSchema = z.object({
    "name": z.array(CharacterNameSchema).optional(),
});
export type LoadCharacters = z.infer<typeof LoadCharactersSchema>;

export const AgentSchema = z.object({
    "agent_id": z.string().optional(),
    "brain_name": z.string().optional(),
    "character_assets": CharacterAssetsSchema.optional(),
    "given_name": z.string().optional(),
});
export type Agent = z.infer<typeof AgentSchema>;

export const UnloadCharactersSchema = z.object({
    "agents": z.array(AgentSchema).optional(),
});
export type UnloadCharacters = z.infer<typeof UnloadCharactersSchema>;

export const MutationEventSchema = z.object({
    "apply_response": ApplyResponseSchema.optional(),
    "cancel_responses": CancelResponsesSchema.optional(),
    "load_characters": LoadCharactersSchema.optional(),
    "load_scene": LoadSceneSchema.optional(),
    "modify_exact_response": ModifyExactResponseSchema.optional(),
    "regenerate_response": RegenerateResponseSchema.optional(),
    "unload_characters": UnloadCharactersSchema.optional(),
});
export type MutationEvent = z.infer<typeof MutationEventSchema>;
