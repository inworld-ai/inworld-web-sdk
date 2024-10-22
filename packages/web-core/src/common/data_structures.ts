import { InworldStatus as ProtoStatus } from '../../proto/ai/inworld/common/status.pb';
import {
  CapabilitiesConfiguration,
  ClientConfiguration as ControlClientConfiguration,
  SessionConfiguration,
  UserConfiguration,
} from '../../proto/ai/inworld/engine/configuration/configuration.pb';
import {
  Continuation,
  CurrentSceneStatus,
  InworldPacket as ProtoPacket,
  SessionHistoryRequest,
  SessionHistoryResponse,
} from '../../proto/ai/inworld/packets/packets.pb';
import { HistoryItem } from '../components/history';
import { Character } from '../entities/character.entity';
import { SessionContinuationProps } from '../entities/continuation/session_continuation.entity';
import { AdditionalPhonemeInfo } from '../entities/packets/audio.entity';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { SessionToken } from '../entities/session_token.entity';
import { ConversationService } from '../services/conversation.service';

export interface Capabilities {
  audio?: boolean;
  debugInfo?: boolean;
  emotions?: boolean;
  interruptions?: boolean;
  logs?: boolean;
  logsWarning?: boolean;
  logsInfo?: boolean;
  logsDebug?: boolean;
  multiModalActionPlanning?: boolean;
  narratedActions?: boolean;
  perceivedLatencyReport?: boolean;
  phonemes?: boolean;
  pingPongReport?: boolean;
  silence?: boolean;
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

export interface sessionContunuationConfig {
  storage?: {
    setItem: (value: string) => Awaitable<void>;
    getItem: () => Awaitable<string>;
  };
  interval?: number;
  attemptsInterval?: number;
  maxAttempts?: number;
}

export interface ConnectionConfig {
  autoReconnect?: boolean;
  disconnectTimeout?: number;
  gateway?: Gateway;
  sessionContunuation?: sessionContunuationConfig;
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
  RECONNECTING = 'RECONNECTING',
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

export interface Extension<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> {
  convertPacketFromProto?: (proto: ProtoPacket) => InworldPacketT;
  beforeLoadScene?: (packets: ProtoPacket[]) => ProtoPacket[];
  afterLoadScene?: (res: CurrentSceneStatus) => void;
  historyItem?: (packet: InworldPacketT, item: HistoryItem) => HistoryItemT;
}

export interface MediaTrackConstraintsWithSuppress
  extends MediaTrackConstraints {
  suppressLocalAudioPlayback?: { ideal: boolean };
}

interface CustomParameter {
  name: string;
  value: string;
}

export interface TaskParameter extends CustomParameter {}
export interface TriggerParameter extends CustomParameter {}

export enum InworldPacketType {
  UNKNOWN = 'UNKNOWN',
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  TASK = 'TASK',
  TRIGGER = 'TRIGGER',
  EMOTION = 'EMOTION',
  LOG = 'LOG',
  CONTROL = 'CONTROL',
  SILENCE = 'SILENCE',
  CANCEL_RESPONSE = 'CANCEL_RESPONSE',
  NARRATED_ACTION = 'NARRATED_ACTION',
  SCENE_MUTATION_REQUEST = 'SCENE_MUTATION_REQUEST',
  SCENE_MUTATION_RESPONSE = 'SCENE_MUTATION_RESPONSE',
  ENTITIES_ITEM_OPERATION = 'ENTITIES_ITEM_OPERATION',
  OPERATION_STATUS = 'OPERATION_STATUS',
  LATENCY_REPORT = 'LATENCY_REPORT',
}

export enum InworlControlAction {
  UNKNOWN = 'UNKNOWN',
  INTERACTION_END = 'INTERACTION_END',
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

export enum InworldLatencyReportType {
  PERCEIVED_LATENCY = 'PERCEIVED_LATENCY',
  PING_PONG = 'PING_PONG',
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

export enum MicrophoneMode {
  UNSPECIFIED = 'UNSPECIFIED',
  OPEN_MIC = 'OPEN_MIC',
  EXPECT_AUDIO_END = 'EXPECT_AUDIO_END',
}

export enum UnderstandingMode {
  FULL = 'FULL',
  SPEECH_RECOGNITION_ONLY = 'SPEECH_RECOGNITION_ONLY',
}

export interface SendPacketParams {
  conversationId: string;
}

export interface SendCustomPacketParams extends SendPacketParams {
  parameters?: TriggerParameter[];
  character?: Character;
}

export interface SendAudioSessionStartPacketParams extends SendPacketParams {
  mode?: MicrophoneMode;
  understandingMode?: UnderstandingMode;
}

export interface AudioSessionStartPacketParams {
  mode?: MicrophoneMode;
  understandingMode?: UnderstandingMode;
}

export interface ConversationMapItem<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  service: ConversationService<InworldPacketT>;
  state: ConversationState;
}

export enum ConversationParticipant {
  USER = 'USER',
}

export interface HistoryChangedProps<HistoryItemT = HistoryItem> {
  diff: { added?: HistoryItemT[]; removed?: HistoryItemT[] };
  conversationId?: string;
}

export interface ChangeSceneProps {
  capabilities?: Capabilities;
  sessionContinuation?: SessionContinuationProps;
  user?: User;
  gameSessionId?: string;
}

export interface LoadedScene {
  sceneStatus: CurrentSceneStatus;
  sessionHistory?: SessionHistoryResponse;
}

export interface ProtoError {
  message: string;
  code: string | undefined;
  details: ProtoStatus[] | undefined;
}

export interface SceneHistoryItem {
  character: Character;
  packet: ProtoPacket;
}

export enum ItemsInEntitiesOperationType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  REPLACE = 'REPLACE',
}

export interface EntityItemProps {
  id: string;
  displayName?: string;
  description?: string;
  properties?: { [key: string]: string };
}

export interface SceneHistoryItem {
  character: Character;
  packet: ProtoPacket;
}

export interface SessionState {
  state?: string;
  creationTime?: string;
  version?: {
    interactionId?: string;
  };
}

export enum LogLevel {
  UNSPECIFIED = 'UNSPECIFIED',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}
