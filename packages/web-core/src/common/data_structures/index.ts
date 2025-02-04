import { InworldStatus as ProtoStatus } from '../../../proto/ai/inworld/common/status.pb';
import {
  CapabilitiesConfiguration,
  ClientConfiguration as ControlClientConfiguration,
  SessionConfiguration,
  UserConfiguration,
} from '../../../proto/ai/inworld/engine/configuration/configuration.pb';
import {
  Continuation,
  CurrentSceneStatus,
  InworldPacket as ProtoPacket,
  SessionHistoryRequest,
  SessionHistoryResponse,
} from '../../../proto/ai/inworld/packets/packets.pb';
import { Character } from '../../entities/character.entity';
import { SessionContinuationProps } from '../../entities/continuation/session_continuation.entity';
import { AdditionalPhonemeInfo } from '../../entities/packets/audio.entity';
import { PerceivedLatencyReportPrecisionType } from '../../entities/packets/latency/perceived_latency_report.entity';
import { SessionToken } from '../../entities/session_token.entity';

export interface Capabilities {
  audio?: boolean;
  debugInfo?: boolean;
  emotions?: boolean;
  interruptions?: boolean;
  logs?: boolean;
  logsWarning?: boolean;
  logsInfo?: boolean;
  logsDebug?: boolean;
  logsInternal?: boolean;
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
  validateData?: boolean;
}

export interface InternalClientConfiguration {
  gameSessionId?: string;
  connection?: ConnectionConfig;
  capabilities: CapabilitiesConfiguration;
  audioPlayback?: AudioPlaybackConfig;
  history?: HistoryConfig;
  validateData?: boolean;
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

export enum InworldTextPacketType {
  UNKNOWN = 'UNKNOWN',
  SPEECH_TO_TEXT = 'SPEECH_TO_TEXT',
  TYPED_IN = 'TYPED_IN',
  GENERATED = 'GENERATED',
  FILLER = 'FILLER',
}

export enum InworlControlAction {
  UNKNOWN = 'UNKNOWN',
  AUDIO_SESSION_START = 'AUDIO_SESSION_START',
  AUDIO_SESSION_END = 'AUDIO_SESSION_END',
  CONVERSATION_EVENT = 'CONVERSATION_EVENT',
  CONVERSATION_UPDATE = 'CONVERSATION_UPDATE',
  INTERACTION_END = 'INTERACTION_END',
  TTS_PLAYBACK_MUTE = 'TTS_PLAYBACK_MUTE',
  TTS_PLAYBACK_UNMUTE = 'TTS_PLAYBACK_UNMUTE',
  WARNING = 'WARNING',
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

export enum ConversationIntializeState {
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

export interface PerceivedLatencyReportProps {
  precision: PerceivedLatencyReportPrecisionType;
  interactionId: string;
  startDate: Date;
  endDate: Date;
}

export enum ConversationParticipant {
  USER = 'USER',
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
  INTERNAL = 'INTERNAL',
  DEBUG = 'DEBUG',
}

export type ProtobufValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ProtobufValue[]
  | { [key: string]: ProtobufValue };

export interface LogsEventLogDetail {
  text: string | undefined;
  detail: ProtobufValue | undefined;
}
