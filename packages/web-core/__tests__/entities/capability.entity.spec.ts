import { Capability } from '../../src/entities/capability.entity';

test('should convert empty capabilities to proto ', () => {
  const proto = Capability.toProto({});

  expect(proto).toEqual({
    audio: true,
    debugInfo: false,
    emotions: false,
    interruptions: false,
    logs: false,
    logsWarning: true,
    logsInfo: false,
    logsDebug: false,
    logsInternal: false,
    multiAgent: true,
    multiModalActionPlanning: false,
    narratedActions: false,
    perceivedLatencyReport: true,
    phonemeInfo: false,
    pingPongReport: true,
    silenceEvents: false,
  });
});

test('should convert implicit capabilities to proto', () => {
  const capabilities = {
    audio: false,
    debugInfo: true,
    emotions: true,
    interruptions: true,
    logs: true,
    logsWarning: false,
    logsInfo: true,
    logsDebug: true,
    logsInternal: true,
    multiModalActionPlanning: true,
    narratedActions: true,
    perceivedLatencyReport: false,
    phonemes: true,
    pingPongReport: false,
    silence: true,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto).toEqual({
    audio: false,
    debugInfo: true,
    emotions: true,
    interruptions: true,
    logs: true,
    logsWarning: false,
    logsInfo: true,
    logsDebug: true,
    logsInternal: true,
    multiAgent: true,
    multiModalActionPlanning: true,
    narratedActions: true,
    perceivedLatencyReport: false,
    phonemeInfo: true,
    pingPongReport: false,
    silenceEvents: true,
  });
});

test('should convert logs capabilities to proto', () => {
  const capabilities = {
    logs: true,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto.logs).toEqual(true);
  expect(proto.logsWarning).toEqual(true);
  expect(proto.logsInfo).toEqual(true);
  expect(proto.logsDebug).toEqual(true);
  expect(proto.logsInternal).toEqual(true);
});

test('should convert logsInfo capabilities to proto', () => {
  const capabilities = {
    logsInfo: true,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto.logs).toEqual(false);
  expect(proto.logsWarning).toEqual(true);
  expect(proto.logsInfo).toEqual(true);
  expect(proto.logsDebug).toEqual(false);
  expect(proto.logsInternal).toEqual(false);
});

test('should convert logsDebug capabilities to proto', () => {
  const capabilities = {
    logsDebug: true,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto.logs).toEqual(false);
  expect(proto.logsWarning).toEqual(true);
  expect(proto.logsInfo).toEqual(false);
  expect(proto.logsDebug).toEqual(true);
  expect(proto.logsInternal).toEqual(false);
});

test('should convert logsInternal capabilities to proto', () => {
  const capabilities = {
    logsInternal: true,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto.logs).toEqual(false);
  expect(proto.logsWarning).toEqual(true);
  expect(proto.logsInfo).toEqual(false);
  expect(proto.logsDebug).toEqual(false);
  expect(proto.logsInternal).toEqual(true);
});
