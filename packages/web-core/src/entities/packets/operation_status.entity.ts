import { OperationStatusEvent as ProtoOperationStatusEvent } from '../../../proto/ai/inworld/packets/packets.pb';
import * as GoogleRpcStatus from '../../../proto/google/rpc/status.pb';

export class OperationStatusEvent {
  readonly status: GoogleRpcStatus.Status;

  constructor({ status }: { status?: GoogleRpcStatus.Status }) {
    this.status = status;
  }

  static fromProto(proto: ProtoOperationStatusEvent) {
    return new OperationStatusEvent({
      status: proto.status,
    });
  }
}
