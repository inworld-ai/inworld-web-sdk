import {
  CapabilitiesConfiguration,
  ClientConfiguration as ControlClientConfiguration,
  SessionConfiguration,
  UserConfiguration,
} from '../../proto/ai/inworld/engine/configuration/configuration.pb';
import {
  Continuation,
  InworldPacket as ProtoPacket,
  SessionControlResponseEvent,
  SessionHistoryRequest,
} from '../../proto/ai/inworld/packets/packets.pb';
import { HistoryItem } from '../components/history';
import { AdditionalPhonemeInfo } from '../entities/packets/audio.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { SessionToken } from '../entities/session_token.entity';
import { ConversationService } from '../services/conversation.service';

export interface Capabilities {
  audio?: boolean;
  emotions?: boolean;
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

export interface SessionControlProps {
  capabilities?: CapabilitiesConfiguration;
  sessionConfiguration?: SessionConfiguration;
  userConfiguration?: UserConfiguration;
  clientConfiguration?: ControlClientConfiguration;
  continuation?: Continuation;
  sessionHistory?: SessionHistoryRequest;
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
  gameSessionId?: string;
  connection?: ConnectionConfig;
  capabilities?: Capabilities;
  audioPlayback?: AudioPlaybackConfig;
  history?: HistoryConfig;
}

export interface InternalClientConfiguration {
  gameSessionId?: string;
  connection?: ConnectionConfig;
  capabilities: CapabilitiesConfiguration;
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
  beforeLoadScene?: (packets: ProtoPacket[]) => ProtoPacket[];
  afterLoadScene?: (res: SessionControlResponseEvent) => void;
  historyItem?: (packet: InworldPacketT, item: HistoryItem) => HistoryItemT;
}

export interface MediaTrackConstraintsWithSuppress
  extends MediaTrackConstraints {
  suppressLocalAudioPlayback?: { ideal: boolean };
}

export interface TriggerParameter {
  name: string;
  value: string;
}

export interface SendTriggerPacketParams {
  parameters?: TriggerParameter[];
  conversationId: string;
}

export enum InworldPacketType {
  UNKNOWN = 'UNKNOWN',
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  TRIGGER = 'TRIGGER',
  EMOTION = 'EMOTION',
  CONTROL = 'CONTROL',
  SILENCE = 'SILENCE',
  CANCEL_RESPONSE = 'CANCEL_RESPONSE',
  NARRATED_ACTION = 'NARRATED_ACTION',
  SCENE_MUTATION_REQUEST = 'SCENE_MUTATION_REQUEST',
  SCENE_MUTATION_RESPONSE = 'SCENE_MUTATION_RESPONSE',
}

export enum InworlControlAction {
  UNKNOWN = 'UNKNOWN',
  INTERACTION_END = 'INTERACTION_END',
  TTS_PLAYBACK_START = 'TTS_PLAYBACK_START',
  TTS_PLAYBACK_END = 'TTS_PLAYBACK_END',
  TTS_PLAYBACK_MUTE = 'TTS_PLAYBACK_MUTE',
  TTS_PLAYBACK_UNMUTE = 'TTS_PLAYBACK_UNMUTE',
  WARNING = 'WARNING',
  CONVERSATION_UPDATE = 'CONVERSATION_UPDATE',
  CONVERSATION_EVENT = 'CONVERSATION_EVENT',
}

export enum InworldConversationEventType {
  UNKNOWN = 'UNKNOWN',
  STARTED = 'STARTED',
  UPDATED = 'UPDATED',
  EVICTED = 'EVICTED',
}

export enum ConversationState {
  ACTIVE = 'ACTIVE',
  PROCESSING = 'PROCESSING',
  INACTIVE = 'INACTIVE',
}

export interface PacketQueueItem {
  getPacket: () => ProtoPacket;
  afterWriting: (packet: ProtoPacket) => void;
}

export interface SendPacketParams {
  conversationId: string;
}

export interface ConversationMapItem<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  service: ConversationService<InworldPacketT>;
  state: ConversationState;
}

export interface HistoryChangedProps<HistoryItemT = HistoryItem> {
  diff: HistoryItemT[];
  conversationId?: string;
}
