import { HistoryItem, InworldConnectionService } from '@inworld/web-sdk';
import { CopyAll, Mic, Send, VolumeOff, VolumeUp } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
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
}

export function Chat(props: ChatProps) {
  const { chatHistory, connection } = props;

  const [text, setText] = useState('');
  const [copyDestination, setCopyDestination] = useState('');
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaybackMuted, setIsPlaybackMuted] = useState(
    connection.player.getMute() ?? false,
  );
  const [hasPlayedWorkaroundSound, setHasPlayedWorkaroundSound] =
    useState(false);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    [],
  );

  const handleCopyClick = useCallback(async () => {
    const history = connection.getTranscript();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(history).then(() => {
        setCopyDestination('clipboard');
      });
    } else {
      setCopyDestination('console');
    }

    setCopyConfirmOpen(true);
  }, [connection, chatHistory]);

  const handleMutePlayback = useCallback(() => {
    connection.recorder.initPlayback();
    connection.player.mute(!isPlaybackMuted);
    setIsPlaybackMuted(!isPlaybackMuted);
    connection.sendTTSPlaybackMute(!isPlaybackMuted);
  }, [connection, isPlaybackMuted]);

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
      return stopRecording();
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
        <Tooltip title={isPlaybackMuted ? 'Unmute' : 'Mute'} placement="top">
          <IconButton onClick={handleMutePlayback}>
            {isPlaybackMuted ? (
              <VolumeOff fontSize="small" />
            ) : (
              <VolumeUp fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={isRecording ? 'Stop speaking' : 'Start speaking'}
          placement="top"
        >
          <IconButton
            onClick={handleSpeakClick}
            sx={{ height: '3rem', width: '3rem', backgroundColor: '#F1F5F9' }}
          >
            {isRecording ? <RecordIcon /> : <Mic />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy transcript" placement="top">
          <IconButton onClick={handleCopyClick}>
            <CopyAll fontSize="small" />
          </IconButton>
        </Tooltip>
      </ActionsStyled>
      <CopyConfirmedDialog
        copyConfirmOpen={copyConfirmOpen}
        copyDestination={copyDestination}
        setCopyConfirmOpen={setCopyConfirmOpen}
      />
    </Box>
  );
}
