import {
  LogsEvent as ProtoLogsEvent,
  LogsEventLogLevel,
} from '../../../proto/ai/inworld/packets/packets.pb';
import {
  LogLevel,
  LogsEventLogDetail,
  ProtobufValue,
} from '../../common/data_structures';

export class LogsEvent {
  readonly text: string;
  readonly level: LogLevel;
  readonly metadata: Record<string, string> | undefined;
  readonly details: LogsEventLogDetail[] | undefined;

  constructor({
    text,
    level,
    metadata,
    details,
  }: {
    text: string;
    level: LogLevel;
    metadata: Record<string, string>;
    details: LogsEventLogDetail[] | undefined;
  }) {
    this.text = text;
    this.level = level;
    this.metadata = metadata;

    if (details?.length >= 0) {
      this.details = details;
    }
  }

  static fromProto(proto: ProtoLogsEvent) {
    return new LogsEvent({
      text: proto.text,
      level: this.getLogLevel(proto.level),
      metadata: proto.metadata,
      details: proto.details?.map((detail) => ({
        text: detail.text,
        detail: detail.detail as ProtobufValue,
      })),
    });
  }

  private static getLogLevel(logLevel: LogsEventLogLevel) {
    switch (logLevel) {
      case LogsEventLogLevel.WARNING:
        return LogLevel.WARNING;
      case LogsEventLogLevel.INFO:
        return LogLevel.INFO;
      case LogsEventLogLevel.DEBUG:
        return LogLevel.DEBUG;
      case LogsEventLogLevel.INTERNAL:
        return LogLevel.INTERNAL;
      default:
        return LogLevel.UNSPECIFIED;
    }
  }
}
