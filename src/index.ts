/**
 * Copyright 2022 Theai, Inc. (DBA Inworld)
 *
 * Use of this source code is governed by the Inworld.ai Software Development Kit License Agreement
 * that can be found in the LICENSE.md file or at https://www.inworld.ai/sdk-license
 */

import { InworldPacket as ProtoPacket } from '../proto/packets.pb';
import { InworldClient } from './clients/inworld.client';
import {
  AudioPlaybackConfig,
  Capabilities,
  ClientConfiguration,
  ConnectionConfig,
  Extension,
  SessionToken,
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
} from './entities/emotion-behavior.entity';
import {
  EmotionStrength,
  EmotionStrengthCode,
} from './entities/emotion-strength.entity';
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
import { InworldConnectionService } from './services/inworld_connection.service';

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
  SessionToken,
  StopAudioPlayback,
  TextEvent,
  TriggerEvent,
  TriggerParameter,
  User,
  UserProfile,
  UserProfileField,
};
