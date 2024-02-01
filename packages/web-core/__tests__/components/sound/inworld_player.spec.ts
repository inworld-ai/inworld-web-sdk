import '../../mocks/window.mock';

import { v4 } from 'uuid';

import { GrpcAudioPlayback } from '../../../src/components/sound/grpc_audio.playback';
import { InworldPlayer } from '../../../src/components/sound/inworld_player';
import { Player } from '../../../src/components/sound/player';

const grpcAudioPlayer = new GrpcAudioPlayback();
let player: InworldPlayer;

beforeEach(() => {
  player = new InworldPlayer({ grpcAudioPlayer });
});

test('should mute', () => {
  const mute = jest
    .spyOn(grpcAudioPlayer, 'mute')
    .mockImplementationOnce(jest.fn());

  player.mute(true);

  expect(mute).toHaveBeenCalledTimes(1);
});

test('should get mute', () => {
  const expected = true;
  const getMute = jest
    .spyOn(grpcAudioPlayer, 'getMute')
    .mockImplementationOnce(() => expected);

  const result = player.getMute();

  expect(getMute).toHaveBeenCalledTimes(1);
  expect(result).toEqual(expected);
});

test('should stop', async () => {
  const stop = jest
    .spyOn(grpcAudioPlayer, 'stop')
    .mockImplementationOnce(jest.fn());

  await player.stop();

  expect(stop).toHaveBeenCalledTimes(1);
});

test('should clear', () => {
  const clear = jest
    .spyOn(grpcAudioPlayer, 'clearQueue')
    .mockImplementationOnce(jest.fn());

  player.clear();

  expect(clear).toHaveBeenCalledTimes(1);
});

test('should play workaround sound', () => {
  const playWorkaroundSound = jest
    .spyOn(Player.prototype, 'playWorkaroundSound')
    .mockImplementationOnce(jest.fn());

  player.playWorkaroundSound();

  expect(playWorkaroundSound).toHaveBeenCalledTimes(1);
});

test('should check if active', () => {
  const isActive = jest.spyOn(grpcAudioPlayer, 'getIsActive');

  player.isActive();

  expect(isActive).toHaveBeenCalledTimes(1);
});

test('should check if has packet with utterance id', () => {
  const params = { utteranceId: v4() };
  const expected = true;
  const hasPacket = jest
    .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
    .mockImplementationOnce(() => expected);

  const result = player.hasPacket(params);

  expect(result).toEqual(expected);
  expect(hasPacket).toHaveBeenCalledTimes(1);
  expect(hasPacket).toHaveBeenCalledWith(params);
});

test('should check if has packet with interaction id', () => {
  const params = { interactionId: v4() };
  const expected = true;
  const hasPacket = jest
    .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
    .mockImplementationOnce(() => expected);

  const result = player.hasPacket(params);

  expect(result).toEqual(expected);
  expect(hasPacket).toHaveBeenCalledTimes(1);
  expect(hasPacket).toHaveBeenCalledWith(params);
});

test('should check if has packet with both ids', () => {
  const params = { interactionId: v4(), utteranceId: v4() };
  const expected = true;
  const hasPacket = jest
    .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
    .mockImplementationOnce(() => expected);

  const result = player.hasPacket(params);

  expect(result).toEqual(expected);
  expect(hasPacket).toHaveBeenCalledTimes(1);
  expect(hasPacket).toHaveBeenCalledWith(params);
});

test('should check if has packet with no ids', () => {
  const params = {};
  const expected = false;
  const hasPacket = jest
    .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
    .mockImplementationOnce(() => expected);

  const result = player.hasPacket(params);

  expect(result).toEqual(expected);
  expect(hasPacket).toHaveBeenCalledTimes(1);
  expect(hasPacket).toHaveBeenCalledWith(params);
});
