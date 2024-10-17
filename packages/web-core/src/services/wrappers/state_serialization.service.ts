import { ProtoError, SessionState } from '../../common/data_structures';
import { ErrorType, InworldError } from '../../entities/error.entity';
import { InworldPacket } from '../../entities/packets/inworld_packet.entity';
import { ConnectionService } from '../connection.service';
import { StateSerializationService as PbService } from '../pb/state_serialization.service';

export class StateSerializationService<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private connection: ConnectionService<InworldPacketT>;
  private service = new PbService();

  constructor(connection: ConnectionService<InworldPacketT>) {
    this.connection = connection;
  }

  async get(attempt: number = 0): Promise<SessionState> {
    let session = await this.connection.ensureSessionToken();

    try {
      return await this.service.getSessionState({
        config: this.connection.getConfig(),
        session,
        scene: this.connection.getSceneName(),
      });
    } catch (protoErr: any) {
      if (attempt) {
        throw protoErr;
      }

      const err = InworldError.fromProto(protoErr as ProtoError);
      const status = err.details?.[0];

      switch (status?.errorType) {
        case ErrorType.SESSION_TOKEN_EXPIRED:
        case ErrorType.SESSION_TOKEN_INVALID:
          await this.connection.ensureSessionToken();
          return this.get(attempt + 1);
        default:
          return;
      }
    }
  }
}
