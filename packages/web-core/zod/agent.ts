import * as z from "zod";


export const CharacterAssetsSchema = z.object({
    "avatar_img": z.string().optional(),
    "avatar_img_original": z.string().optional(),
    "rpm_image_uri_portrait": z.string().optional(),
    "rpm_image_uri_posture": z.string().optional(),
    "rpm_model_uri": z.string().optional(),
});
export type CharacterAssets = z.infer<typeof CharacterAssetsSchema>;

export const AgentSchema = z.object({
    "agent_id": z.string().optional(),
    "brain_name": z.string().optional(),
    "character_assets": CharacterAssetsSchema.optional(),
    "given_name": z.string().optional(),
});
export type Agent = z.infer<typeof AgentSchema>;
