import { Capability } from '../../src/entities/capability.entity';

test('should convert empty capabilities to proto', () => {
  const proto = Capability.toProto({});

  expect(proto).toEqual({
    audio: true,
    debugInfo: false,
    emotions: false,
    interruptions: false,
    logs: true,
    logsWarning: true,
    logsInfo: true,
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

test('should convert logsInfo capabilities to proto', () => {
  const capabilities = {
    logsWarning: false,
    logsInfo: true,
    logsDebug: false,
    logsInternal: false,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto.logs).toEqual(true);
  expect(proto.logsWarning).toEqual(false);
  expect(proto.logsInfo).toEqual(true);
  expect(proto.logsDebug).toEqual(false);
  expect(proto.logsInternal).toEqual(false);
});

test('should convert logsDebug capabilities to proto', () => {
  const capabilities = {
    logsWarning: false,
    logsInfo: false,
    logsDebug: true,
    logsInternal: false,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto.logs).toEqual(true);
  expect(proto.logsWarning).toEqual(false);
  expect(proto.logsInfo).toEqual(false);
  expect(proto.logsDebug).toEqual(true);
  expect(proto.logsInternal).toEqual(false);
});

test('should convert logsInternal capabilities to proto', () => {
  const capabilities = {
    logsWarning: false,
    logsInfo: false,
    logsDebug: false,
    logsInternal: true,
  };

  const proto = Capability.toProto(capabilities);

  expect(proto.logs).toEqual(true);
  expect(proto.logsWarning).toEqual(false);
  expect(proto.logsInfo).toEqual(false);
  expect(proto.logsDebug).toEqual(false);
  expect(proto.logsInternal).toEqual(true);
});
