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

  async get() {
    const session = await this.connection.ensureSessionToken();

    return this.service.getSessionState({
      config: this.connection.getConfig(),
      session,
      scene: this.connection.getSceneName(),
    });
  }
}
