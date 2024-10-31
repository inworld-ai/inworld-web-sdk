import { z } from "zod";
import { RoutingSchema } from "../../zod/routing";
import { LatencyReportEventSchema, PacketIdSchema } from "../../zod/latency_report_event";
import { TextEventSchema } from "../../zod/text_event";
import { ControlEventSchema } from "../../zod/control_event";
import { CustomEventSchema } from "../../zod/custom_event";
import { CancelResponsesEventSchema } from "../../zod/cancel_responses_event";
import { EmotionEventSchema } from "../../zod/emotion_event";
import { DataChunkSchema } from "../../zod/data_chunk";
import { ActionEventSchema } from "../../zod/action_event";
import { MutationEventSchema } from "../../zod/mutation_event";
import { SessionControlEventSchema } from "../../zod/session_control_event";
import { ItemsOperationEventSchema } from "../../zod/items_operation_event";

export const InworldPacketSchema = z.object({
	timestamp: z.coerce.date().optional(),
	routing: RoutingSchema.optional(),
	packetId: PacketIdSchema.optional(),
	text: TextEventSchema.optional(),
	control: ControlEventSchema.optional(),
	custom: CustomEventSchema.optional(),
	cancelResponses: CancelResponsesEventSchema.optional(),
	emotion: EmotionEventSchema.optional(),
	dataChunk: DataChunkSchema.optional(),
	action: ActionEventSchema.optional(),
	mutation: MutationEventSchema.optional(),
	sessionControl: SessionControlEventSchema.optional(),
	latencyReport: LatencyReportEventSchema.optional(),
	entitiesItemsOperation: ItemsOperationEventSchema.optional(),
});
