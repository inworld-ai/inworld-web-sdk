import { PacketId as ProtoPacketId } from '../../../proto/ai/inworld/packets/packets.pb';

export class PacketId {
  readonly packetId: string;
  readonly utteranceId: string | undefined;
  readonly interactionId: string | undefined;
  readonly correlationId: string | undefined;
  readonly conversationId: string | undefined;

  constructor({
    packetId,
    utteranceId,
    interactionId,
    correlationId,
    conversationId,
  }: {
    packetId: string;
    utteranceId?: string;
    interactionId?: string;
    correlationId?: string;
    conversationId?: string;
  }) {
    this.packetId = packetId;

    if (utteranceId) {
      this.utteranceId = utteranceId;
    }

    if (interactionId) {
      this.interactionId = interactionId;
    }

    if (correlationId) {
      this.correlationId = correlationId;
    }

    if (conversationId) {
      this.conversationId = conversationId;
    }
  }

  static fromProto(proto: ProtoPacketId) {
    return new PacketId({
      packetId: proto.packetId,
      utteranceId: proto.utteranceId,
      interactionId: proto.interactionId,
      correlationId: proto.correlationId,
      conversationId: proto.conversationId,
    });
  }
}
