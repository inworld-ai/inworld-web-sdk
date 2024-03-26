import { DataChunk } from '../../../proto/ai/inworld/packets/packets.pb';

export class SilenceEvent {
  readonly durationMs: number;

  constructor({ durationMs }: { durationMs: number }) {
    this.durationMs = durationMs;
  }

  static fromProto(proto: DataChunk) {
    return new SilenceEvent({
      durationMs: parseInt(proto.durationMs, 10),
    });
  }
}
