import { CustomEvent as ProtoTaskEvent } from '../../../proto/ai/inworld/packets/packets.pb';
import { TaskParameter } from '../../common/data_structures';

export class TaskEvent {
  readonly name: string;
  readonly parameters: TaskParameter[] | undefined;

  constructor({
    name,
    parameters,
  }: {
    name: string;
    parameters?: TaskParameter[];
  }) {
    this.name = name;

    if (parameters?.length) {
      this.parameters = parameters;
    }
  }

  static fromProto(proto: ProtoTaskEvent) {
    return new TaskEvent({
      name: proto.name,
      parameters: proto.parameters?.map((p) => ({
        name: p.name,
        value: p.value,
      })),
    });
  }
}
