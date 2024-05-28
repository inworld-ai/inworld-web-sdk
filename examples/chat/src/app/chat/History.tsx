import {
  Actor,
  Character,
  CHAT_HISTORY_TYPE,
  DislikeType,
  HistoryItem,
  HistoryItemActor,
  HistoryItemNarratedAction,
  HistoryItemSceneChange,
  HistoryItemTriggerEvent,
  InworldConnectionService,
} from '@inworld/web-core';
import { Box, Fade, Stack } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { CircularRpmAvatar } from '../components/CircularRpmAvatar';
import { getEmoji } from '../helpers/emoji';
import { dateWithMilliseconds } from '../helpers/transform';
import { CHAT_VIEW, EmotionsMap, FeedbackMap } from '../types';
import {
  HistoryAction,
  HistoryActor,
  HistoryInner,
  HistoryItemMessageActor,
  HistoryMessageGroup,
  HistoryStyled,
} from './Chat.styled';
import { FeedbackMenu } from './FeedbackMenu';
import { Typing } from './Typing';

interface HistoryProps {
  chatView: CHAT_VIEW;
  characters: Character[];
  history: HistoryItem[];
  emotions: EmotionsMap;
  onInteractionEnd: (value: boolean) => void;
  connection: InworldConnectionService;
}

type CombinedHistoryItem = {
  interactionId: string;
  messages: (
    | HistoryItemActor
    | HistoryItemNarratedAction
    | HistoryItemTriggerEvent
    | HistoryItemSceneChange
  )[];
  source: Actor;
  type: CHAT_HISTORY_TYPE;
};

export const History = (props: HistoryProps) => {
  const { chatView, connection, history } = props;

  const ref = useRef<HTMLDivElement>(null);

  const [combinedChatHistory, setCombinedChatHistory] = useState<
    CombinedHistoryItem[]
  >([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackMap>({});
  const [isInteractionEnd, setIsInteractionEnd] = useState<boolean>(true);

  const handleLike = React.useCallback(
    async (interactionId: string) => {
      return connection.feedback
        .like({
          interactionId,
        })
        .then((feedback) =>
          setFeedbacks({
            ...feedbacks,
            [interactionId]: feedback,
          }),
        );
    },
    [connection.feedback, feedbacks],
  );

  const handleDislike = React.useCallback(
    async (interactionId: string, type: DislikeType) => {
      return connection.feedback
        .dislike({
          interactionId,
          types: [type],
        })
        .then((feedback) =>
          setFeedbacks({
            ...feedbacks,
            [interactionId]: feedback,
          }),
        );
    },
    [connection.feedback, feedbacks],
  );

  const handleUndo = React.useCallback(
    async (interactionId: string, name: string) => {
      return connection.feedback.undo(name).then(() => {
        const newFeedbacks = { ...feedbacks };
        delete newFeedbacks[interactionId];
        setFeedbacks(newFeedbacks);
      });
    },
    [connection.feedback, feedbacks],
  );

  useEffect(() => {
    // scroll chat down on history change
    if (ref.current && history) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  useEffect(() => {
    let currentRecord: CombinedHistoryItem | undefined;
    const mergedRecords: CombinedHistoryItem[] = [];
    const hasActors = history.find(
      (record: HistoryItem) => record.type === CHAT_HISTORY_TYPE.ACTOR,
    );
    const withoutTriggerEvents = history.filter((record: HistoryItem) =>
      [CHAT_HISTORY_TYPE.ACTOR, CHAT_HISTORY_TYPE.INTERACTION_END].includes(
        record.type,
      ),
    );

    for (let i = 0; i < history.length; i++) {
      let item = history[i];
      switch (item.type) {
        case CHAT_HISTORY_TYPE.ACTOR:
        case CHAT_HISTORY_TYPE.NARRATED_ACTION:
          currentRecord = mergedRecords.find(
            (r) =>
              r.interactionId === item.interactionId &&
              [
                CHAT_HISTORY_TYPE.ACTOR,
                CHAT_HISTORY_TYPE.NARRATED_ACTION,
              ].includes(r.messages?.[0]?.type) &&
              r.type === CHAT_HISTORY_TYPE.ACTOR &&
              r.source.name === item.source.name,
          ) as CombinedHistoryItem;

          if (currentRecord) {
            currentRecord.messages.push(item);
          } else {
            currentRecord = {
              interactionId: item.interactionId,
              messages: [item],
              source: item.source,
              type: CHAT_HISTORY_TYPE.ACTOR,
            } as CombinedHistoryItem;
            mergedRecords.push(currentRecord);
          }
          break;
        case CHAT_HISTORY_TYPE.TRIGGER_EVENT:
        case CHAT_HISTORY_TYPE.SCENE_CHANGE:
          mergedRecords.push({
            interactionId: item.interactionId!,
            messages: [item],
            source: item.source,
            type: item.type,
          });
          break;
      }
    }

    // Interaction is considered ended
    // when there is no actor action yet (chat is not started)
    // or last received message is INTERACTION_END.
    const lastInteractionId =
      withoutTriggerEvents[withoutTriggerEvents.length - 1]?.interactionId;

    const interactionEnd = withoutTriggerEvents.find(
      (event) =>
        event.interactionId === lastInteractionId &&
        event.type === CHAT_HISTORY_TYPE.INTERACTION_END,
    );
    const isInteractionEnd =
      !hasActors || (!!currentRecord && !!interactionEnd);

    setIsInteractionEnd(isInteractionEnd);
    props.onInteractionEnd(isInteractionEnd);

    setCombinedChatHistory(mergedRecords);
  }, [history, props.onInteractionEnd]);

  const getContent = (
    message:
      | HistoryItemActor
      | HistoryItemNarratedAction
      | HistoryItemTriggerEvent
      | HistoryItemSceneChange,
  ) => {
    switch (message.type) {
      case CHAT_HISTORY_TYPE.ACTOR:
        return message.text;
      case CHAT_HISTORY_TYPE.NARRATED_ACTION:
        return <HistoryAction>{message.text}</HistoryAction>;
      case CHAT_HISTORY_TYPE.TRIGGER_EVENT:
        return message.name;
      case CHAT_HISTORY_TYPE.SCENE_CHANGE:
        return message.to
          ? `Now moving to ${message.to}`
          : `New characters in scene: ${message.addedCharacters
              ?.map((c) => c.displayName)
              .join(', ')}`;
    }
  };

  return (
    <HistoryStyled
      className={chatView === CHAT_VIEW.AVATAR ? `history--avatar-view` : ''}
    >
      <HistoryInner ref={ref}>
        <Box className="history--avatar-list">
          {combinedChatHistory.map((item, index) => {
            let emoji: string | null = null;
            let messages = item.messages;
            let actorSource = 'AGENT';
            let message = item.messages?.[0];

            const character =
              [
                CHAT_HISTORY_TYPE.ACTOR,
                CHAT_HISTORY_TYPE.NARRATED_ACTION,
              ].includes(item.type) &&
              item.messages[0].characters?.find(
                (c: Character) => c.id === item.source.name,
              );

            const title =
              item.type === CHAT_HISTORY_TYPE.ACTOR ||
              item.type === CHAT_HISTORY_TYPE.TRIGGER_EVENT
                ? `${dateWithMilliseconds(message.date)} (${
                    item.interactionId
                  })`
                : '';

            if (item.type === CHAT_HISTORY_TYPE.ACTOR) {
              actorSource = item.source.isCharacter ? 'AGENT' : 'PLAYER';

              if (item.source.isCharacter) {
                const emotion = props.emotions[item.interactionId!];
                if (emotion?.behavior) {
                  emoji = getEmoji(emotion.behavior);
                }
              }
            }

            const src =
              character?.assets?.rpmImageUriPortrait ??
              character?.assets?.avatarImg;

            return (
              <HistoryMessageGroup
                key={`PortalSimulatorChatHistoryMessageGroup-${index}`}
                className={`history-message-group history-message-group--${actorSource}`}
              >
                <HistoryActor
                  className="chat__bubble"
                  key={index}
                  data-id={message.id}
                >
                  <Stack
                    sx={{ maxWidth: ['90%', '85%'] }}
                    flexDirection={'row'}
                    alignItems="center"
                  >
                    <HistoryItemMessageActor
                      className="history-actor"
                      key={`PortalSimulatorChatHistoryActor-${index}`}
                    >
                      {item.source.isCharacter && src && (
                        <CircularRpmAvatar
                          key={index}
                          src={src}
                          name={character?.displayName}
                          size="48px"
                          sx={{
                            display: ['none', 'flex'],
                            mr: 1,
                            float: 'left',
                          }}
                        />
                      )}
                      {item.source.isCharacter &&
                        !src &&
                        (character?.displayName ?? '')}
                      {emoji && (
                        <Box className="simulator-message__emoji" fontSize={16}>
                          {emoji}
                        </Box>
                      )}
                      <Box>
                        <span title={title}>
                          {messages.map((m) => (
                            <React.Fragment key={m.id}>
                              {getContent(m)}
                            </React.Fragment>
                          ))}
                        </span>
                        {item.source.isCharacter && (
                          <FeedbackMenu
                            feedback={feedbacks[item.interactionId!]}
                            interactionId={item.interactionId!}
                            handleLike={handleLike}
                            handleDislike={handleDislike}
                            handleUndo={handleUndo}
                          />
                        )}
                      </Box>
                    </HistoryItemMessageActor>
                  </Stack>
                </HistoryActor>
              </HistoryMessageGroup>
            );
          })}
          <Fade in={!isInteractionEnd} timeout={500}>
            <Box margin="0 0 20px 20px">
              <Typing />
            </Box>
          </Fade>
        </Box>
      </HistoryInner>
    </HistoryStyled>
  );
};
