import '../../mocks/window.mock';

import { GrpcAudioRecorder } from '../../../src/components/sound/grpc_audio.recorder';
import { setTimeoutMock } from '../../helpers';

const timeoutMockCalls = (timeout: any) =>
  timeout.mock.calls.filter((ctx: any) => ctx[1] !== 0).length;

let recorder: GrpcAudioRecorder;

beforeEach(() => {
  recorder = new GrpcAudioRecorder();
});

test('should start convertion', () => {
  const setInterval = jest
    .spyOn(global, 'setInterval')
    .mockImplementationOnce(setTimeoutMock);

  recorder.startConvertion(new MediaStream(), jest.fn());

  expect(recorder.isRecording()).toEqual(true);
  expect(timeoutMockCalls(setInterval)).toEqual(1);
});

test('should do nothing if convertion is not started', () => {
  expect(recorder.isRecording()).toEqual(false);
  recorder.stopConvertion();
  expect(recorder.isRecording()).toEqual(false);
});

test('should stop convertion', () => {
  recorder.startConvertion(new MediaStream(), jest.fn());
  expect(recorder.isRecording()).toEqual(true);
  recorder.stopConvertion();
  expect(recorder.isRecording()).toEqual(false);
});

test('should get is recording false by default', () => {
  expect(recorder.isRecording()).toEqual(false);
});
