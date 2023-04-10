import {
  CHAT_HISTORY_TYPE,
  HistoryItem,
  InworldConnectionService,
} from '@inworld/web-sdk';
import { CopyAll, Mic, Send } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useState } from 'react';

import { CHAT_VIEW, EmotionsMap } from '../types';
import { ActionsStyled, RecordIcon } from './Chat.styled';
import { CopyConfirmedDialog } from './CopyConfirmedDialog';
import { History } from './History';

interface ChatProps {
  chatView: CHAT_VIEW;
  chatHistory: HistoryItem[];
  connection: InworldConnectionService;
  emotions: EmotionsMap;
  playerName: string;
}

export function Chat(props: ChatProps) {
  const { chatHistory, connection, playerName } = props;

  const [text, setText] = useState('');
  const [copyDestination, setCopyDestination] = useState('');
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPlayedWorkaroundSound, setHasPlayedWorkaroundSound] =
    useState(false);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    [],
  );

  const formatTranscript = useCallback(
    (messages: HistoryItem[]) => {
      let transcript = '';
      let characterLastSpeaking = false; // Used to combine all Character text chunks

      messages.forEach((item) => {
        switch (item.type) {
          case CHAT_HISTORY_TYPE.ACTOR:
            const isCharacter = item.source.isCharacter;
            const givenName = isCharacter
              ? item.character?.getDisplayName()
              : playerName;

            transcript +=
              characterLastSpeaking && isCharacter
                ? item.text
                : `\n${givenName}: ${item.text}`;
            characterLastSpeaking = isCharacter;
            break;
        }
      });

      return transcript;
    },
    [playerName],
  );

  const getTranscript = useCallback(
    (messages: HistoryItem[], startId?: string, endId?: string) => {
      if (!messages.length) {
        return '';
      }

      // get full array by default
      let startIndex: number = 0;
      let endIndex: number = messages.length - 1;

      if (startId || endId) {
        // find start/end indexes of the slice if ids are specified
        messages.forEach((item, index) => {
          if (item.id === startId) {
            startIndex = index;
          }

          if (item.id === endId) {
            endIndex = index;
          }
        });
      }

      if (endIndex < startIndex) {
        const tmp = startIndex;
        startIndex = endIndex;
        endIndex = tmp;
      }

      // generate eventual transcript
      return formatTranscript(messages.slice(startIndex, endIndex + 1));
    },
    [formatTranscript],
  );

  const handleCopyClick = useCallback(async () => {
    const history = getTranscript(chatHistory);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(history).then(() => {
        setCopyDestination('clipboard');
      });
    } else {
      setCopyDestination('console');
    }

    setCopyConfirmOpen(true);
  }, [getTranscript, chatHistory]);

  const stopRecording = useCallback(() => {
    connection.recorder.stop();
    setIsRecording(false);
    connection.sendAudioSessionEnd();
  }, [connection]);

  const startRecording = useCallback(async () => {
    try {
      connection.sendAudioSessionStart();
      await connection.recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  }, [connection]);

  const playWorkaroundSound = useCallback(() => {
    // Workaround for browsers with restrictive auto-play policies
    connection.player.playWorkaroundSound();
    setHasPlayedWorkaroundSound(true);
  }, [connection, setHasPlayedWorkaroundSound]);

  const handleSend = useCallback(() => {
    if (text) {
      !hasPlayedWorkaroundSound && playWorkaroundSound();

      connection?.sendText(text);

      setText('');
    }
  }, [connection, hasPlayedWorkaroundSound, playWorkaroundSound, text]);

  const handleTextKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    },
    [handleSend],
  );

  const handleSpeakClick = useCallback(async () => {
    !hasPlayedWorkaroundSound && playWorkaroundSound();

    if (isRecording) {
      stopRecording();
      connection.sendAudioSessionEnd();
      setIsRecording(false);
      return;
    }

    return startRecording();
  }, [
    connection,
    hasPlayedWorkaroundSound,
    isRecording,
    playWorkaroundSound,
    startRecording,
    stopRecording,
  ]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'relative',
        paddingBottom: '4.5rem',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      <History
        history={chatHistory}
        chatView={props.chatView}
        emotions={props.emotions}
      />
      <ActionsStyled>
        <TextField
          variant="standard"
          fullWidth
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleTextKeyPress}
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRadius: '1rem',
            padding: '1rem',
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend}>
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
        />
        <IconButton
          onClick={handleSpeakClick}
          sx={{ height: '3rem', width: '3rem', backgroundColor: '#F1F5F9' }}
        >
          {isRecording ? <RecordIcon /> : <Mic />}
        </IconButton>
        <IconButton onClick={handleCopyClick}>
          <CopyAll fontSize="small" />
        </IconButton>
      </ActionsStyled>
      <CopyConfirmedDialog
        copyConfirmOpen={copyConfirmOpen}
        copyDestination={copyDestination}
        setCopyConfirmOpen={setCopyConfirmOpen}
      />
    </Box>
  );
}
