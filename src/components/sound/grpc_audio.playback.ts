import { decode } from 'base64-arraybuffer';

import { Awaitable, OnPhomeneFn } from '../../common/interfaces';
import { InworldPacket } from '../../entities/inworld_packet.entity';

interface AudioQueueItem {
  packet: InworldPacket;
  onBeforePlaying?: (packet: InworldPacket) => void;
  onAfterPlaying?: (packet: InworldPacket) => void;
}

export class GrpcAudioPlayback {
  private currentItem: AudioQueueItem | undefined;
  private audioQueue: AudioQueueItem[] = [];

  private isPlaying = false;

  private playbackAudioContext = new AudioContext({ sampleRate: 16000 });
  private audioBufferSourceNode?: AudioBufferSourceNode;

  private onAfterPlaying:
    | ((message: InworldPacket) => Awaitable<void>)
    | undefined;
  private onBeforePlaying:
    | ((message: InworldPacket) => Awaitable<void>)
    | undefined;
  private onStopPlaying: (() => Awaitable<void>) | undefined;
  private onPhoneme: OnPhomeneFn;

  destinationNode = this.playbackAudioContext.createMediaStreamDestination();

  constructor(props?: {
    onAfterPlaying?: (message: InworldPacket) => Awaitable<void>;
    onBeforePlaying?: (message: InworldPacket) => Awaitable<void>;
    onStopPlaying?: () => Awaitable<void>;
    onPhoneme?: OnPhomeneFn;
  }) {
    this.onAfterPlaying = props?.onAfterPlaying;
    this.onBeforePlaying = props?.onBeforePlaying;
    this.onStopPlaying = props?.onStopPlaying;
    this.onPhoneme = props?.onPhoneme;
  }

  getIsActive(): boolean {
    return this.isPlaying;
  }

  addToQueue(item: AudioQueueItem): void {
    this.audioQueue.push(item);
    if (!this.isPlaying) {
      this.playQueue();
    }
  }

  clearQueue() {
    this.isPlaying = false;
    this.audioQueue = [];
  }

  excludeCurrentInteractionPackets(exceptInteractionId: string) {
    const toExlcude = this.audioQueue.filter(
      (item: AudioQueueItem) =>
        item.packet.packetId.interactionId !== exceptInteractionId &&
        item.packet.packetId.interactionId ===
          this.currentItem?.packet?.packetId.interactionId,
    );

    if (toExlcude.length) {
      this.audioQueue = this.audioQueue.filter(
        (item: AudioQueueItem) =>
          item.packet.packetId.interactionId !==
          this.currentItem?.packet?.packetId.interactionId,
      );
    }

    const result: AudioQueueItem[] = [...toExlcude];

    if (
      this.currentItem &&
      this.currentItem.packet.packetId.interactionId !== exceptInteractionId
    )
      result.unshift(this.currentItem);

    return result.map((item: AudioQueueItem) => item.packet);
  }

  hasPacketInQueue(props: {
    interactionId?: string;
    utteranceId?: string;
  }): boolean {
    const { interactionId, utteranceId } = props;
    return !!this.audioQueue.find((item: AudioQueueItem) => {
      let result = true;
      const packetId = item.packet.packetId;

      if (interactionId && packetId.interactionId !== interactionId) {
        result = false;
      }

      if (utteranceId && packetId.utteranceId !== utteranceId) {
        result = false;
      }

      return result;
    });
  }

  isCurrentPacket(props: {
    interactionId?: string;
    utteranceId?: string;
  }): boolean {
    const { interactionId, utteranceId } = props;
    const { packetId } = this.currentItem?.packet || {};

    let result = true;

    if (interactionId && packetId?.interactionId !== interactionId) {
      result = false;
    }

    if (utteranceId && packetId.utteranceId !== utteranceId) {
      result = false;
    }

    return result;
  }

  getPlaybackStream() {
    return this.destinationNode.stream;
  }

  stop() {
    this.getSourceNode().disconnect();
    delete this.audioBufferSourceNode;
  }

  async init() {
    // Way past safari autoplay. Should be called from inside direct user interaction.
    await this.playbackAudioContext.resume().catch(console.error);
  }

  private getSourceNode(): AudioBufferSourceNode {
    if (!this.audioBufferSourceNode) {
      this.audioBufferSourceNode = new AudioBufferSourceNode(
        this.playbackAudioContext,
      );
      this.audioBufferSourceNode.connect(this.destinationNode);
      this.audioBufferSourceNode.onended = () => {
        this.onAfterPlaying?.(this.currentItem.packet!);
        this.currentItem.onAfterPlaying?.(this.currentItem.packet!);
        this.currentItem = undefined;
        this.playQueue();
      };
    }
    return this.audioBufferSourceNode;
  }

  private playQueue = async (): Promise<void> => {
    if (!this.audioQueue.length) {
      this.getSourceNode().buffer = null;
      this.isPlaying = false;
      this.onStopPlaying?.();
      return;
    }

    this.currentItem = this.audioQueue.shift();
    this.isPlaying = true;

    let audioBuffer;
    const { packet } = this.currentItem || {};

    if (packet?.isSilence() && packet.silence.durationMs) {
      const durationSec = packet.silence.durationMs / 1000;
      audioBuffer = this.playbackAudioContext.createBuffer(
        2,
        this.playbackAudioContext.sampleRate * durationSec,
        this.playbackAudioContext.sampleRate,
      );
    } else {
      audioBuffer = await this.playbackAudioContext.decodeAudioData(
        // convertion due to grpc-gateway ws specific.
        decode(packet.audio.chunk),
      );
    }

    this.stop();

    this.getSourceNode().buffer = audioBuffer;
    if (packet.isAudio() && packet.audio.additionalPhonemeInfo) {
      this.onPhoneme?.(packet.audio.additionalPhonemeInfo);
    }
    this.getSourceNode().start();
    this.onBeforePlaying?.(packet!);
    this.currentItem.onBeforePlaying?.(packet);
  };
}
