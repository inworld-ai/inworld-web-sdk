import {
  AdditionalPhonemeInfo as ProtoAdditionalPhonemeInfo,
  DataChunk,
} from '../../../proto/ai/inworld/packets/packets.pb';

export interface AdditionalPhonemeInfo {
  phoneme?: string;
  startOffsetS?: number;
}

export class AudioEvent {
  readonly chunk: string;
  // Available only when metadata is loaded.
  // I.e. before audio playing.
  readonly durationMs: number | undefined;
  readonly additionalPhonemeInfo: AdditionalPhonemeInfo[] | undefined;

  constructor({
    chunk,
    durationMs,
    additionalPhonemeInfo,
  }: {
    chunk: string;
    durationMs?: number;
    additionalPhonemeInfo?: AdditionalPhonemeInfo[];
  }) {
    this.chunk = chunk;
    this.durationMs = durationMs;
    this.additionalPhonemeInfo = additionalPhonemeInfo;
  }

  static fromProto(proto: DataChunk) {
    return new AudioEvent({
      chunk: proto.chunk as unknown as string,
      additionalPhonemeInfo: (proto.additionalPhonemeInfo ?? []).map(
        (info: ProtoAdditionalPhonemeInfo) =>
          ({
            phoneme: info.phoneme,
            startOffsetS: parseFloat(info.startOffset),
          }) as AdditionalPhonemeInfo,
      ),
    });
  }
}
