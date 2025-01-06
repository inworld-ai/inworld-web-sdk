import {
  CurrentSceneStatus,
  InworldPacket as ProtoPacket,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { Character } from '../../entities/character.entity';
import { InworldPacket } from '../../entities/packets/inworld_packet.entity';
import { HistoryItem } from './history';
import {
  AudioSessionStartPacketParams,
  CancelResponsesProps,
  SendPacketParams,
  TriggerParameter,
} from './index';

export interface Extension<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> {
  convertPacketFromProto?: (proto: ProtoPacket) => InworldPacketT;
  beforeLoadScene?: (packets: ProtoPacket[]) => ProtoPacket[];
  afterLoadScene?: (res: CurrentSceneStatus) => void;
  historyItem?: (packet: InworldPacketT, item: HistoryItem) => HistoryItemT;
}

export interface ConvesationInterface<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  getConversationId(): string;
  getParticipants(): string[];
  getCharacters(): Character[];
  changeParticipants(participants: string[]): void;
  updateParticipants(
    participants: string[],
  ): Promise<ConvesationInterface<InworldPacketT>> | void;
  sendText: (text: string) => Promise<InworldPacketT>;
  sendAudio: (chunk: string) => Promise<InworldPacketT>;
  sendTrigger: (
    name: string,
    parameters?: { parameters?: TriggerParameter[]; character?: Character },
  ) => Promise<InworldPacketT>;
  sendAudioSessionStart(
    params?: AudioSessionStartPacketParams,
  ): Promise<InworldPacketT>;
  sendAudioSessionEnd(): Promise<InworldPacketT>;
  sendCancelResponse(
    cancelResponses?: CancelResponsesProps,
  ): Promise<InworldPacketT>;
  sendTTSPlaybackMute(isMuted: boolean): Promise<InworldPacketT>;
  sendNarratedAction(text: string): Promise<InworldPacketT>;
  sendCustomPacket(
    getPacket: (params: SendPacketParams) => ProtoPacket,
  ): Promise<InworldPacketT>;
}
