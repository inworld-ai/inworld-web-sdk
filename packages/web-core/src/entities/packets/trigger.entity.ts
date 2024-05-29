import { CustomEvent as ProtoTriggerEvent } from '../../../proto/ai/inworld/packets/packets.pb';
import { TriggerParameter } from '../../common/data_structures';

export class TriggerEvent {
  readonly name: string;
  readonly parameters: TriggerParameter[] | undefined;

  constructor({
    name,
    parameters,
  }: {
    name: string;
    parameters?: TriggerParameter[];
  }) {
    this.name = name;

    if (parameters?.length) {
      this.parameters = parameters;
    }
  }

  static fromProto(proto: ProtoTriggerEvent) {
    return new TriggerEvent({
      name: proto.name,
      parameters: proto.parameters?.map((p) => ({
        name: p.name,
        value: p.value,
      })),
    });
  }
}
