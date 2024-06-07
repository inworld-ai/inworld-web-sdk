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
  readonly additionalPhonemeInfo: AdditionalPhonemeInfo[] | undefined;
  // Available only when metadata is loaded.
  // I.e. before audio playing.
  durationMs: number | undefined;

  constructor({
    chunk,
    additionalPhonemeInfo,
  }: {
    chunk: string;
    additionalPhonemeInfo?: AdditionalPhonemeInfo[];
  }) {
    this.chunk = chunk;

    if (additionalPhonemeInfo?.length) {
      this.additionalPhonemeInfo = additionalPhonemeInfo;
    }
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
