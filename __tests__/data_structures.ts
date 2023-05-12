import { CapabilitiesRequest } from '../proto/world-engine.pb';
import { Capabilities } from '../src/common/data_structures';
import { InworldPacket } from '../src/entities/inworld_packet.entity';

export interface ExtendedCapabilities extends Capabilities {
  regenerateResponse: boolean;
}

export interface ExtendedCapabilitiesRequest extends CapabilitiesRequest {
  regenerateResponse: boolean;
}

export interface RegenerateResponse {
  interactionId?: string;
}

export interface MutationEvent {
  regenerateResponse?: RegenerateResponse;
}

export interface ExtendedInworldPacket extends InworldPacket {
  mutation: MutationEvent;
}
