import '../../mocks/window.mock';

import { v4 } from 'uuid';

import { DataChunkDataType } from '../../../proto/packets.pb';
import { GrpcAudioPlayback } from '../../../src/components/sound/grpc_audio.playback';
import { InworldPacket } from '../../../src/entities/inworld_packet.entity';
import { getPacketId } from '../../helpers';

const audioEvent = InworldPacket.fromProto({
  dataChunk: {
    chunk: v4() as unknown as Uint8Array,
    type: DataChunkDataType.AUDIO,
  },
  routing: {
    source: {},
    target: {},
  },
  packetId: getPacketId(),
});

let playback: GrpcAudioPlayback;

beforeEach(() => {
  jest.clearAllMocks();

  playback = new GrpcAudioPlayback();
});

describe('isActive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be false by default', () => {
    expect(playback.getIsActive()).toEqual(false);
  });

  test('should be true on audio adding', () => {
    playback.addToQueue({
      packet: audioEvent,
    });

    expect(playback.getIsActive()).toEqual(true);
  });

  test('should be false on clear', () => {
    playback.addToQueue({
      packet: audioEvent,
    });

    playback.clearQueue();

    expect(playback.getIsActive()).toEqual(false);
  });
});

describe('hasPacketInQueue', () => {
  test('should be false for empty queue', () => {
    expect(playback.hasPacketInQueue({ interactionId: v4() })).toEqual(false);
  });

  test('should be false if packet is not in queue for interactionId only provided', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    expect(playback.hasPacketInQueue({ interactionId: v4() })).toEqual(false);
  });

  test('should be false if packet is not in queue for utteranceId only provided', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    expect(playback.hasPacketInQueue({ utteranceId: v4() })).toEqual(false);
  });

  test('should be true if packet is in queue', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    playback.addToQueue({
      packet: audioEvent,
    });
    expect(
      playback.hasPacketInQueue({
        utteranceId: audioEvent.packetId.utteranceId,
        interactionId: audioEvent.packetId.interactionId,
      }),
    ).toEqual(true);
  });
});

describe('isCurrentPacket', () => {
  test('should be false for empty queue', () => {
    expect(playback.isCurrentPacket({ interactionId: v4() })).toEqual(false);
  });

  test('should be false if packet is not in queue for interactionId only provided', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    expect(playback.isCurrentPacket({ interactionId: v4() })).toEqual(false);
  });

  test('should be false if packet is not in queue for utteranceId only provided', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    expect(playback.isCurrentPacket({ utteranceId: v4() })).toEqual(false);
  });

  test('should be true if packet is in queue', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    expect(
      playback.isCurrentPacket({
        utteranceId: audioEvent.packetId.utteranceId,
        interactionId: audioEvent.packetId.interactionId,
      }),
    ).toEqual(true);
  });
});

describe('excludeCurrentInteractionPackets', () => {
  test('should exclude all packets with different interaction from queue', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    playback.addToQueue({
      packet: audioEvent,
    });

    expect(playback.excludeCurrentInteractionPackets(v4()).length).toEqual(2);
  });

  test('should not exclude packets with the same interaction from queue', () => {
    playback.addToQueue({
      packet: audioEvent,
    });
    playback.addToQueue({
      packet: audioEvent,
    });

    expect(
      playback.excludeCurrentInteractionPackets(
        audioEvent.packetId.interactionId,
      ).length,
    ).toEqual(0);
  });
});
