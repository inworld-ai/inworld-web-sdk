import { InworldPacket as ProtoPacket } from '../../proto/packets.pb';
import {
  CapabilitiesRequest,
  LoadSceneRequest,
  LoadSceneResponse,
} from '../../proto/world-engine.pb';
import { AdditionalPhonemeInfo } from '../entities/inworld_packet.entity';

export interface Capabilities {
  audio?: boolean;
  emotions?: boolean;
  continuation?: boolean;
  interruptions?: boolean;
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

export interface SessionToken {
  token: string;
  type: string;
  expirationTime: string;
  sessionId: string;
}

export interface Gateway {
  hostname: string;
  ssl?: boolean;
}

export interface AudioPlaybackConfig {
  stop: StopAudioPlayback;
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
export interface ClientConfiguration<CapabilitiesT> {
  connection?: ConnectionConfig;
  capabilities?: CapabilitiesT;
  audioPlayback?: AudioPlaybackConfig;
}

export interface InternalClientConfiguration {
  connection?: ConnectionConfig;
  capabilities: CapabilitiesRequest;
  audioPlayback?: AudioPlaybackConfig;
}

export interface CancelResponses {
  [key: string]: boolean;
}

export interface CancelResponsesProps {
  interactionId?: string;
  utteranceId?: string[];
}

export type Awaitable<T> = T | PromiseLike<T>;
export type VoidFn = () => void;
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

export type ExtensionLoadSceneProps = Omit<
  LoadSceneRequest,
  'name' | 'capabilities' | 'user' | 'client'
>;

export interface Extension<InworldPacketT> {
  convertPacketFromProto?: (proto: ProtoPacket) => InworldPacketT;
  beforeLoadScene?: (request: LoadSceneRequest) => LoadSceneRequest;
  afterLoadScene?: (res: LoadSceneResponse) => void;
}
