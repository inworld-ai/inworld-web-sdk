import {
  LogsEvent as ProtoLogsEvent,
  LogsEventLogLevel,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { LogLevel } from '../../common/data_structures';

export class LogsEvent {
  readonly text: string;
  readonly level: LogLevel;
  readonly metadata: Record<string, string> | undefined;

  constructor({
    text,
    level,
    metadata,
  }: {
    text: string;
    level: LogLevel;
    metadata: Record<string, string>;
  }) {
    this.text = text;
    this.level = level;
    this.metadata = metadata;
  }

  static fromProto(proto: ProtoLogsEvent) {
    return new LogsEvent({
      text: proto.text,
      level: this.getLogLevel(proto.level),
      metadata: proto.metadata,
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
