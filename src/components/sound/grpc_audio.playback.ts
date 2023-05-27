import { decode } from 'base64-arraybuffer';

import {
  AudioPlaybackConfig,
  Awaitable,
  OnPhomeneFn,
} from '../../common/data_structures';
import { interpolate } from '../../common/helpers';
import { InworldPacket } from '../../entities/inworld_packet.entity';

interface AudioQueueItem<InworldPacketT> {
  packet: InworldPacketT;
  onBeforePlaying?: (packet: InworldPacketT) => void;
  onAfterPlaying?: (packet: InworldPacketT) => void;
}

export class GrpcAudioPlayback<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private currentItem: AudioQueueItem<InworldPacketT> | undefined;
  private audioQueue: AudioQueueItem<InworldPacketT>[] = [];
  private audioPlaybackConfig: AudioPlaybackConfig = {
    stop: {
      duration: 500, // 0.5 second,
      ticks: 25,
    },
  };

  private isPlaying = false;
  private isStopping = false;

  playbackAudioContext = new AudioContext({ sampleRate: 16000 });
  private audioBufferSourceNode?: AudioBufferSourceNode;

  private onAfterPlaying:
    | ((message: InworldPacketT) => Awaitable<void>)
    | undefined;
  private onBeforePlaying:
    | ((message: InworldPacketT) => Awaitable<void>)
    | undefined;
  private onStopPlaying: (() => Awaitable<void>) | undefined;
  private onPhoneme: OnPhomeneFn;

  private destinationNode =
    this.playbackAudioContext.createMediaStreamDestination();
  private gainNode: GainNode = this.playbackAudioContext.createGain();

  constructor(props?: {
    audioPlaybackConfig?: AudioPlaybackConfig;
    onAfterPlaying?: (message: InworldPacketT) => Awaitable<void>;
    onBeforePlaying?: (message: InworldPacketT) => Awaitable<void>;
    onStopPlaying?: () => Awaitable<void>;
    onPhoneme?: OnPhomeneFn;
  }) {
    if (props?.audioPlaybackConfig) {
      this.audioPlaybackConfig = props.audioPlaybackConfig;
    }

    this.onAfterPlaying = props?.onAfterPlaying;
    this.onBeforePlaying = props?.onBeforePlaying;
    this.onStopPlaying = props?.onStopPlaying;
    this.onPhoneme = props?.onPhoneme;

    this.gainNode.connect(this.playbackAudioContext.destination);
  }

  getIsActive(): boolean {
    return this.isPlaying;
  }

  addToQueue(item: AudioQueueItem<InworldPacketT>): void {
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
      (item: AudioQueueItem<InworldPacketT>) =>
        item.packet.packetId.interactionId !== exceptInteractionId &&
        item.packet.packetId.interactionId ===
          this.currentItem?.packet?.packetId.interactionId,
    );

    if (toExlcude.length) {
      this.audioQueue = this.audioQueue.filter(
        (item: AudioQueueItem<InworldPacketT>) =>
          item.packet.packetId.interactionId !==
          this.currentItem?.packet?.packetId.interactionId,
      );
    }

    const result: AudioQueueItem<InworldPacketT>[] = [...toExlcude];

    if (
      this.currentItem &&
      this.currentItem.packet.packetId.interactionId !== exceptInteractionId
    )
      result.unshift(this.currentItem);

    return result.map((item: AudioQueueItem<InworldPacketT>) => item.packet);
  }

  hasPacketInQueue(props: {
    interactionId?: string;
    utteranceId?: string;
  }): boolean {
    const { interactionId, utteranceId } = props;
    return !!this.audioQueue.find((item: AudioQueueItem<InworldPacketT>) => {
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

  getCurrentPacket() {
    return this.currentItem?.packet;
  }

  getPlaybackStream() {
    return this.destinationNode.stream;
  }

  async stop() {
    if (this.audioBufferSourceNode) {
      this.audioBufferSourceNode.onended = null;
    }

    this.currentItem = undefined;
    this.isStopping = true;

    await this.adjustVolume(0);

    this.isStopping = false;
    this.clearSourceNode();
  }

  async stopForInteraction(interactionId: string) {
    const packets = this.excludeCurrentInteractionPackets(interactionId);

    if (this.currentItem && !this.isCurrentPacket({ interactionId })) {
      await this.stop();
      this.playQueue();
    }

    return packets;
  }

  async init() {
    // Way past safari autoplay. Should be called from inside direct user interaction.
    await this.playbackAudioContext.resume().catch(console.error);
  }

  private clearSourceNode() {
    if (this.audioBufferSourceNode) {
      this.audioBufferSourceNode.disconnect();
    }

    this.gainNode.gain.value = 1;

    delete this.audioBufferSourceNode;
  }

  private getSourceNode(): AudioBufferSourceNode {
    if (!this.audioBufferSourceNode) {
      this.audioBufferSourceNode = new AudioBufferSourceNode(
        this.playbackAudioContext,
      );
      this.audioBufferSourceNode.connect(this.gainNode);
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
    if (this.isStopping) return;

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

    this.clearSourceNode();

    this.getSourceNode().buffer = audioBuffer;
    if (packet.isAudio() && packet.audio.additionalPhonemeInfo) {
      this.onPhoneme?.(packet.audio.additionalPhonemeInfo);
    }
    this.getSourceNode().start();
    this.onBeforePlaying?.(packet!);
    this.currentItem.onBeforePlaying?.(packet);
  };

  private adjustVolume(newVolume: number): Promise<void> {
    const originalVolume = this.gainNode.gain.value;
    const delta = newVolume - originalVolume;

    if (!delta) {
      return Promise.resolve();
    }

    const { duration, ticks } = this.audioPlaybackConfig?.stop;

    let tick = 1;
    const interval = Math.floor(duration / ticks);

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        this.gainNode.gain.value =
          originalVolume + interpolate(tick / ticks) * delta;

        if (++tick === ticks + 1) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  }
}
