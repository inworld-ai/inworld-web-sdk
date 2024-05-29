import '../../mocks/window.mock';

import { GrpcAudioPlayback } from '../../../src/components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../../../src/components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import { InworldRecorder } from '../../../src/components/sound/inworld_recorder';
import { setNavigatorProperty } from '../../helpers';

const grpcAudioPlayer = new GrpcAudioPlayback();
const grpcAudioRecorder = new GrpcAudioRecorder();
const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();
const listener = jest.fn();
let recorder: InworldRecorder;

beforeEach(() => {
  setNavigatorProperty('mediaDevices', {});
  setNavigatorProperty('userAgent', '');

  recorder = new InworldRecorder({
    grpcAudioPlayer,
    grpcAudioRecorder,
    listener,
    webRtcLoopbackBiDiSession,
  });

  jest
    .spyOn(HTMLAudioElement.prototype, 'play')
    .mockImplementationOnce(jest.fn());
});

afterEach(() => {
  setNavigatorProperty('mediaDevices', {});
  setNavigatorProperty('userAgent', '');
});

test('should start', async () => {
  const getUserMedia = jest.fn();

  const startSession = jest
    .spyOn(webRtcLoopbackBiDiSession, 'startSession')
    .mockImplementationOnce(jest.fn());

  jest
    .spyOn(webRtcLoopbackBiDiSession, 'getPlaybackLoopbackStream')
    .mockImplementationOnce(() => new MediaStream());
  jest
    .spyOn(webRtcLoopbackBiDiSession, 'getRecorderLoopBackStream')
    .mockImplementationOnce(() => new MediaStream());

  const startConvertion = jest
    .spyOn(grpcAudioRecorder, 'startConvertion')
    .mockImplementationOnce(jest.fn());

  setNavigatorProperty('mediaDevices', { getUserMedia });

  await recorder.start();

  expect(startSession).toHaveBeenCalledTimes(1);
  expect(getUserMedia).toHaveBeenCalledTimes(1);
  expect(startConvertion).toHaveBeenCalledTimes(1);
});

test('should stop after start', async () => {
  jest
    .spyOn(webRtcLoopbackBiDiSession, 'startSession')
    .mockImplementationOnce(jest.fn());

  jest
    .spyOn(webRtcLoopbackBiDiSession, 'getPlaybackLoopbackStream')
    .mockImplementationOnce(() => new MediaStream());
  jest
    .spyOn(webRtcLoopbackBiDiSession, 'getRecorderLoopBackStream')
    .mockImplementationOnce(() => new MediaStream());

  jest
    .spyOn(grpcAudioRecorder, 'startConvertion')
    .mockImplementationOnce(jest.fn());

  setNavigatorProperty('mediaDevices', {
    getUserMedia: () => new MediaStream(),
  });

  const stop = jest
    .spyOn(grpcAudioRecorder, 'stopConvertion')
    .mockImplementationOnce(jest.fn());

  await recorder.start();

  recorder.stop();

  expect(stop).toHaveBeenCalledTimes(1);
});

test('should not throw on stop without start', async () => {
  jest
    .spyOn(webRtcLoopbackBiDiSession, 'startSession')
    .mockImplementationOnce(jest.fn());

  jest
    .spyOn(webRtcLoopbackBiDiSession, 'getPlaybackLoopbackStream')
    .mockImplementationOnce(() => new MediaStream());
  jest
    .spyOn(webRtcLoopbackBiDiSession, 'getRecorderLoopBackStream')
    .mockImplementationOnce(() => new MediaStream());

  jest
    .spyOn(grpcAudioRecorder, 'startConvertion')
    .mockImplementationOnce(jest.fn());

  setNavigatorProperty('mediaDevices', {
    getUserMedia: () => new MediaStream(),
  });

  const stop = jest
    .spyOn(grpcAudioRecorder, 'stopConvertion')
    .mockImplementationOnce(jest.fn());

  recorder.stop();

  expect(stop).toHaveBeenCalledTimes(1);
});

test('should init playback', () => {
  const init = jest
    .spyOn(grpcAudioPlayer, 'init')
    .mockImplementationOnce(jest.fn());

  jest
    .spyOn(webRtcLoopbackBiDiSession, 'startSession')
    .mockImplementationOnce(jest.fn());

  jest
    .spyOn(webRtcLoopbackBiDiSession, 'getPlaybackLoopbackStream')
    .mockImplementationOnce(() => new MediaStream());

  recorder.initPlayback();

  expect(init).toHaveBeenCalledTimes(1);
});

test('should get is recording', () => {
  const expected = true;

  const isRecording = jest
    .spyOn(grpcAudioRecorder, 'isRecording')
    .mockImplementationOnce(() => expected);

  const result = recorder.isRecording();

  expect(result).toEqual(expected);
  expect(isRecording).toHaveBeenCalledTimes(1);
});

test('should get is supported true', () => {
  setNavigatorProperty('userAgent', 'iPhone');

  const result = recorder.isSupported();

  expect(result).toEqual(true);
});

test('should get is supported false', () => {
  setNavigatorProperty('userAgent', 'Firefox');

  const result = recorder.isSupported();

  expect(result).toEqual(false);
});

test('should get is active', () => {
  const expected = true;

  recorder.setIsActive(expected);

  expect(recorder.getIsActive()).toEqual(expected);
});
