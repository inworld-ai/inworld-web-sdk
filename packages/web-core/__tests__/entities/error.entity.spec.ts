import { v4 } from 'uuid';

import {
  ErrorType as ProtoErrorType,
  ReconnectionType as ProtoErrorReconnectionType,
  ResourceType as ProtoErrorResourceType,
} from '../../proto/ai/inworld/common/status.pb';
import { ProtoError } from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import {
  ErrorReconnectionType,
  ErrorResourceType,
  ErrorType,
  InworldError,
} from '../../src/entities/error.entity';

const errorTypeTestTable = [
  {
    input: ProtoErrorType.SESSION_TOKEN_EXPIRED,
    expected: ErrorType.SESSION_TOKEN_EXPIRED,
  },
  {
    input: ProtoErrorType.SESSION_TOKEN_INVALID,
    expected: ErrorType.SESSION_TOKEN_INVALID,
  },
  {
    input: ProtoErrorType.SESSION_RESOURCES_EXHAUSTED,
    expected: ErrorType.SESSION_RESOURCES_EXHAUSTED,
  },
  {
    input: ProtoErrorType.BILLING_TOKENS_EXHAUSTED,
    expected: ErrorType.BILLING_TOKENS_EXHAUSTED,
  },
  {
    input: ProtoErrorType.ACCOUNT_DISABLED,
    expected: ErrorType.ACCOUNT_DISABLED,
  },
  {
    input: ProtoErrorType.SESSION_INVALID,
    expected: ErrorType.SESSION_INVALID,
  },
  {
    input: ProtoErrorType.RESOURCE_NOT_FOUND,
    expected: ErrorType.RESOURCE_NOT_FOUND,
  },
  {
    input: ProtoErrorType.SAFETY_VIOLATION,
    expected: ErrorType.SAFETY_VIOLATION,
  },
  {
    input: ProtoErrorType.SESSION_EXPIRED,
    expected: ErrorType.SESSION_EXPIRED,
  },
  {
    input: ProtoErrorType.AUDIO_SESSION_EXPIRED,
    expected: ErrorType.AUDIO_SESSION_EXPIRED,
  },
  {
    input: ProtoErrorType.SESSION_PAUSED,
    expected: ErrorType.SESSION_PAUSED,
  },
];

const reconnectTypeTestTable = [
  {
    input: ProtoErrorReconnectionType.UNDEFINED,
    expected: ErrorReconnectionType.UNDEFINED,
  },
  {
    input: ProtoErrorReconnectionType.NO_RETRY,
    expected: ErrorReconnectionType.NO_RETRY,
  },
  {
    input: ProtoErrorReconnectionType.IMMEDIATE,
    expected: ErrorReconnectionType.IMMEDIATE,
  },
  {
    input: ProtoErrorReconnectionType.TIMEOUT,
    expected: ErrorReconnectionType.TIMEOUT,
  },
];

const resourceTypeTestTable = [
  {
    input: ProtoErrorResourceType.RESOURCE_TYPE_UNDEFINED,
    expected: ErrorResourceType.RESOURCE_TYPE_UNDEFINED,
  },
  {
    input: ProtoErrorResourceType.RESOURCE_TYPE_CONVERSATION,
    expected: ErrorResourceType.RESOURCE_TYPE_CONVERSATION,
  },
];

test.each(errorTypeTestTable)(
  'should correctly convert type $input',
  ({ input, expected }) => {
    const protoErr = {
      message: v4(),
      code: v4(),
      details: [
        {
          errorType: input,
        },
      ],
    } as ProtoError;

    const err = InworldError.fromProto(protoErr);

    expect(err.message).toEqual(protoErr.message);
    expect(err.code).toEqual(protoErr.code);
    expect(err.details).toHaveLength(1);
    expect(err.details[0].errorType).toEqual(expected);
  },
);

test.each(reconnectTypeTestTable)(
  'should correctly convert reconnect type $input',
  ({ input, expected }) => {
    const protoErr = {
      message: v4(),
      code: v4(),
      details: [
        {
          reconnectType: input,
          ...(input === ProtoErrorReconnectionType.TIMEOUT && {
            reconnectTime: protoTimestamp(),
          }),
        },
      ],
    } as ProtoError;

    const err = InworldError.fromProto(protoErr);

    expect(err.message).toEqual(protoErr.message);
    expect(err.code).toEqual(protoErr.code);
    expect(err.details).toHaveLength(1);
    expect(err.details[0].reconnectType).toEqual(expected);
  },
);

test.each(resourceTypeTestTable)(
  'should correctly convert resource type $input',
  ({ input, expected }) => {
    const protoErr = {
      message: v4(),
      code: v4(),
      details: [
        {
          resourceNotFound: {
            resourceType: input,
          },
        },
      ],
    } as ProtoError;

    const err = InworldError.fromProto(protoErr);

    expect(err.message).toEqual(protoErr.message);
    expect(err.code).toEqual(protoErr.code);
    expect(err.details).toHaveLength(1);
    expect(err.details[0].resourceNotFound?.resourceType).toEqual(expected);
  },
);
