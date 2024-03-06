import {
  CapabilitiesRequest,
  LoadSceneRequest,
  LoadSceneResponse,
} from '../../proto/ai/inworld/engine/world-engine.pb';
import { InworldPacket as ProtoPacket } from '../../proto/ai/inworld/packets/packets.pb';
import { HistoryItem } from '../components/history';
import { Character } from '../entities/character.entity';
import { AdditionalPhonemeInfo } from '../entities/inworld_packet.entity';
import { SessionToken } from '../entities/session_token.entity';

export interface Capabilities {
  audio?: boolean;
  emotions?: boolean;
  interruptions?: boolean;
  multiAgent?: boolean;
  narratedActions?: boolean;
  phonemes?: boolean;
  silence?: boolean;
  turnBasedStt?: boolean;
}

export interface UserProfileField {
  id: string;
  value: string;
}

export interface UserProfile {
  fields: UserProfileField[];
}

export interface User {
  id?: string;
  fullName?: string;
  profile?: UserProfile;
}

export interface Client {
  id?: string;
}

export interface Gateway {
  hostname: string;
  ssl?: boolean;
}

export interface AudioPlaybackConfig {
  sampleRate?: number;
  stop?: StopAudioPlayback;
}

export interface StopAudioPlayback {
  duration: number;
  ticks: number;
}

export interface ConnectionConfig {
  autoReconnect?: boolean;
  disconnectTimeout?: number;
  gateway?: Gateway;
}

export interface HistoryConfig {
  previousState?: boolean;
}

export interface ClientConfiguration {
  connection?: ConnectionConfig;
  capabilities?: Capabilities;
  audioPlayback?: AudioPlaybackConfig;
  history?: HistoryConfig;
}

export interface InternalClientConfiguration {
  connection?: ConnectionConfig;
  capabilities: CapabilitiesRequest;
  audioPlayback?: AudioPlaybackConfig;
  history?: HistoryConfig;
}

export interface CancelResponses {
  [key: string]: boolean;
}

export interface CancelResponsesProps {
  interactionId?: string;
  utteranceId?: string[];
}

export type Awaitable<T> = T | PromiseLike<T>;
export type GenerateSessionTokenFn = () => Promise<SessionToken>;
export type OnPhomeneFn =
  | ((phonemeData: AdditionalPhonemeInfo[]) => void)
  | undefined;

export enum ConnectionState {
  ACTIVE = 'ACTIVE',
  ACTIVATING = 'ACTIVATING',
  LOADED = 'LOADED',
  LOADING = 'LOADING',
  INACTIVE = 'INACTIVE',
}

export enum AudioSessionState {
  UNKNOWN = 'UNKNOWN',
  START = 'START',
  END = 'END',
}

export enum TtsPlaybackAction {
  UNKNOWN = 'UNKNOWN',
  MUTE = 'MUTE',
  UNMUTE = 'UNMUTE',
}

export interface Extension<InworldPacketT, HistoryItemT> {
  convertPacketFromProto?: (proto: ProtoPacket) => InworldPacketT;
  beforeLoadScene?: (request: LoadSceneRequest) => LoadSceneRequest;
  afterLoadScene?: (res: LoadSceneResponse) => void;
  historyItem?: (packet: InworldPacketT, item: HistoryItem) => HistoryItemT;
}

export interface MediaTrackConstraintsWithSuppress
  extends MediaTrackConstraints {
  suppressLocalAudioPlayback?: { ideal: boolean };
}

export interface SendPacketParams {
  characters?: Character[];
}
