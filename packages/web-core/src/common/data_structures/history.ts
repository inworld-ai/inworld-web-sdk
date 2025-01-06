import { LogsEventLogDetail } from '../../../proto/ai/inworld/packets/packets.pb';
import { Character } from '../../entities/character.entity';
import { EmotionEvent } from '../../entities/packets/emotion/emotion.entity';
import { Actor } from '../../entities/packets/routing.entity';
import { LogLevel, TaskParameter, TriggerParameter } from './index';

export enum CHAT_HISTORY_TYPE {
  ACTOR = 'actor',
  CONVERSATION_UPDATE = 'conversation_update',
  INTERACTION_END = 'interaction_end',
  LOG_EVENT = 'log_event',
  NARRATED_ACTION = 'narrated_action',
  SCENE_CHANGE = 'scene_change',
  TRIGGER_EVENT = 'trigger_event',
  TASK_EVENT = 'task_event',
}

export interface HistoryItemBase {
  date: Date;
  id: string;
  scene: string;
  interactionId?: string;
  source: Actor;
  type: CHAT_HISTORY_TYPE;
  fromHistory?: boolean;
  conversationId: string;
}

export interface HistoryItemActor extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.ACTOR;
  text?: string;
  emotions?: EmotionEvent;
  isRecognizing?: boolean;
  // TODO: Remove this field in the next major release.
  character?: Character;
  characters?: Character[];
  correlationId?: string;
}

export interface HistoryItemTriggerEvent extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.TRIGGER_EVENT;
  name: string;
  parameters: TriggerParameter[];
  outgoing?: boolean;
  correlationId?: string;
}

export interface HistoryItemTaskEvent extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.TASK_EVENT;
  name: string;
  parameters: TaskParameter[];
  outgoing?: boolean;
  correlationId?: string;
}

export interface HistoryInteractionEnd extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.INTERACTION_END;
}

export interface HistoryItemNarratedAction extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.NARRATED_ACTION;
  text?: string;
  // TODO: Remove this field in the next major release.
  character?: Character;
  characters?: Character[];
}

export interface HistoryItemLogEvent extends HistoryItemBase {
  type: CHAT_HISTORY_TYPE.LOG_EVENT;
  text: string;
  level: LogLevel;
  metadata?: Record<string, string>;
  details?: LogsEventLogDetail[];
}

export interface HistoryItemSceneChange {
  date: Date;
  id: string;
  interactionId?: string;
  source: Actor;
  type: CHAT_HISTORY_TYPE.SCENE_CHANGE;
  to?: string;
  description?: string;
  displayName?: string;
  loadedCharacters?: Character[];
  addedCharacters?: Character[];
  removedCharacters?: Character[];
  conversationId?: string;
  fromHistory?: boolean;
}

export interface HistoryItemConversationUpdate {
  date: Date;
  id: string;
  interactionId?: string;
  source: Actor;
  type: CHAT_HISTORY_TYPE.CONVERSATION_UPDATE;
  conversationId?: string;
  currentCharacters?: Character[];
  addedCharacters?: Character[];
  removedCharacters?: Character[];
  fromHistory?: boolean;
}

export type HistoryItem =
  | HistoryItemActor
  | HistoryItemLogEvent
  | HistoryItemTriggerEvent
  | HistoryItemTaskEvent
  | HistoryInteractionEnd
  | HistoryItemNarratedAction
  | HistoryItemSceneChange
  | HistoryItemConversationUpdate;

export interface HistoryChangedProps<HistoryItemT = HistoryItem> {
  diff: { added?: HistoryItemT[]; removed?: HistoryItemT[] };
  conversationId?: string;
}
