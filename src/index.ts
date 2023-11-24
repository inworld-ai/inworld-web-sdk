/**
 * Copyright 2022 Theai, Inc. (DBA Inworld)
 *
 * Use of this source code is governed by the Inworld.ai Software Development Kit License Agreement
 * that can be found in the LICENSE.md file or at https://www.inworld.ai/sdk-license
 */

import { InworldPacket as ProtoPacket } from '../proto/ai/inworld/packets/packets.pb';
import { InworldClient } from './clients/inworld.client';
import {
  AudioPlaybackConfig,
  Capabilities,
  ClientConfiguration,
  ConnectionConfig,
  Extension,
  StopAudioPlayback,
  User,
  UserProfile,
  UserProfileField,
} from './common/data_structures';
import {
  CHAT_HISTORY_TYPE,
  HistoryInteractionEnd,
  HistoryItem,
  HistoryItemActor,
  HistoryItemBase,
  HistoryItemNarratedAction,
  HistoryItemTriggerEvent,
} from './components/history';
import { Character } from './entities/character.entity';
import {
  DialogParticipant,
  DialogPhrase,
  PreviousDialog,
} from './entities/continuation/previous_dialog.entity';
import {
  SessionContinuation,
  SessionContinuationProps,
} from './entities/continuation/session_continuation.entity';
import {
  EmotionBehavior,
  EmotionBehaviorCode,
} from './entities/emotion_behavior.entity';
import {
  EmotionStrength,
  EmotionStrengthCode,
} from './entities/emotion_strength.entity';
import {
  Actor,
  AdditionalPhonemeInfo,
  AudioEvent,
  CancelResponsesEvent,
  EmotionEvent,
  InworldPacket,
  PacketId,
  Routing,
  TextEvent,
  TriggerEvent,
  TriggerParameter,
} from './entities/inworld_packet.entity';
import { SessionToken } from './entities/session_token.entity';
import { InworldConnectionService } from './services/inworld_connection.service';
import { SessionState } from './services/pb/state_serialization.service';

export {
  Actor,
  AdditionalPhonemeInfo,
  AudioEvent,
  AudioPlaybackConfig,
  CancelResponsesEvent,
  Capabilities,
  Character,
  CHAT_HISTORY_TYPE,
  ClientConfiguration,
  ConnectionConfig,
  DialogParticipant,
  DialogPhrase,
  EmotionBehavior,
  EmotionBehaviorCode,
  EmotionEvent,
  EmotionStrength,
  EmotionStrengthCode,
  Extension,
  HistoryInteractionEnd,
  HistoryItem,
  HistoryItemActor,
  HistoryItemBase,
  HistoryItemNarratedAction,
  HistoryItemTriggerEvent,
  InworldClient,
  InworldConnectionService,
  InworldPacket,
  PacketId,
  PreviousDialog,
  ProtoPacket,
  Routing,
  SessionContinuation,
  SessionContinuationProps,
  SessionState,
  SessionToken,
  StopAudioPlayback,
  TextEvent,
  TriggerEvent,
  TriggerParameter,
  User,
  UserProfile,
  UserProfileField,
};
