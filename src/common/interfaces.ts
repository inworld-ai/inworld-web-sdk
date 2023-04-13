import { CapabilitiesRequest } from '../../proto/world-engine.pb';
import { AdditionalPhonemeInfo } from '../entities/inworld_packet.entity';

export interface Capabilities {
  audio?: boolean;
  emotions?: boolean;
  interruptions?: boolean;
  narratedActions?: boolean;
  phonemes?: boolean;
  silence?: boolean;
  turnBasedStt?: boolean;
}

export interface User {
  id?: string;
  fullName?: string;
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

export interface ConnectionConfig {
  autoReconnect?: boolean;
  disconnectTimeout?: number;
  gateway?: Gateway;
}
export interface ClientConfiguration {
  connection?: ConnectionConfig;
  capabilities?: Capabilities;
}

export interface InternalClientConfiguration {
  connection?: ConnectionConfig;
  capabilities: CapabilitiesRequest;
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

export enum AudioSessionAction {
  UNKNOWN = 'UNKNOWN',
  START = 'START',
  END = 'END',
}
