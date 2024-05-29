import '../../mocks/window.mock';

import { GrpcWebRtcLoopbackBiDiSession } from '../../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import { setNavigatorProperty } from '../../helpers';

let session: GrpcWebRtcLoopbackBiDiSession;

beforeEach(() => {
  setNavigatorProperty('userAgent', '');

  session = new GrpcWebRtcLoopbackBiDiSession();
});

afterEach(() => {
  setNavigatorProperty('userAgent', '');
});

test('should start session for iOS mobile', async () => {
  setNavigatorProperty('userAgent', 'iPhone');

  const inputStream = new MediaStream();
  const outputStream = new MediaStream();

  await session.startSession(inputStream, outputStream);

  expect(session.getRecorderLoopBackStream()).toEqual(inputStream);
  expect(session.getPlaybackLoopbackStream()).toEqual(outputStream);
});

test('should start session for not iOS mobile', async () => {
  const inputStream = new MediaStream();
  const outputStream = new MediaStream();

  await session.startSession(inputStream, outputStream);

  expect(session.getRecorderLoopBackStream()).not.toEqual(inputStream);
  expect(session.getPlaybackLoopbackStream()).not.toEqual(outputStream);
});

test('should throw error if playback loopback stream is empty', () => {
  expect(() => {
    session.getPlaybackLoopbackStream();
  }).toThrowError('No loopbackPlaybackStream available');
});

test('should throw error if recorder loopback stream is empty', () => {
  expect(() => {
    session.getRecorderLoopBackStream();
  }).toThrowError('No loopbackRecordStream available');
});
