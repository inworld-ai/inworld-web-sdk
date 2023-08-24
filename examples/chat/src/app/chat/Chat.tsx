import { HistoryItem, InworldConnectionService } from '@inworld/web-sdk';
import { CopyAll, Mic, Send, VolumeOff, VolumeUp } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useState } from 'react';

import { CHAT_VIEW, EmotionsMap } from '../types';
import { ActionsStyled, RecordIcon } from './Chat.styled';
import { ConfirmedDialog } from './ConfirmedDialog';
import { History } from './History';
import { SessionActions } from './SessionActions';

const LOCAL_STORAGE_KEY = 'inworldSessionState';

interface ChatProps {
  chatView: CHAT_VIEW;
  chatHistory: HistoryItem[];
  connection: InworldConnectionService;
  emotions: EmotionsMap;
  onRestore: (state: Uint8Array) => Promise<void>;
}

export function Chat(props: ChatProps) {
  const { chatHistory, connection } = props;

  const [text, setText] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaybackMuted, setIsPlaybackMuted] = useState(
    connection.player.getMute() ?? false,
  );
  const [hasPlayedWorkaroundSound, setHasPlayedWorkaroundSound] =
    useState(false);
  const [isInteractionEnd, setIsInteractionEnd] = useState<boolean>(false);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    [],
  );

  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);

  const handleCopyClick = useCallback(async () => {
    const history = connection.getTranscript();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(history).then(() => {
        setConfirmText('Transcript successfully copied to clipboard');
      });
    } else {
      setConfirmText('Transcript successfully copied to console');
    }

    setConfirmOpen(true);
  }, [connection, chatHistory]);

  const handleClearStateClick = useCallback(() => {
    localStorage.removeItem('inworldSessionState');
    setConfirmText('Session state successfully cleared from local storage');
    setConfirmOpen(true);
  }, []);

  const handleSaveStateClick = useCallback(async () => {
    const state = await connection.getSessionState();

    if (state) {
      localStorage.setItem('inworldSessionState', JSON.stringify(state));
      setConfirmText('Session state successfully saved to local storage');
      setConfirmOpen(true);
    } else {
      setConfirmText('Session state could not be saved. Try again');
      setConfirmOpen(true);
    }
  }, [connection]);

  const handleRestoreStateClick = useCallback(() => {
    if (savedState) {
      props.onRestore(JSON.parse(savedState));
      setConfirmText('Session state successfully restored from local storage');
      setConfirmOpen(true);
    } else {
      setConfirmText('Session state could not be restored. Try again');
      setConfirmOpen(true);
    }
  }, [props.onRestore, savedState]);

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
        onInteractionEnd={setIsInteractionEnd}
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
        <SessionActions
          onClear={() => handleClearStateClick()}
          onSave={handleSaveStateClick}
          onRestore={handleRestoreStateClick}
          clearDisabled={!savedState}
          saveDisabled={!chatHistory.length || !isInteractionEnd}
          restoreDisabled={!savedState}
        />
        <Tooltip title="Copy transcript" placement="top">
          <IconButton onClick={handleCopyClick}>
            <CopyAll fontSize="small" />
          </IconButton>
        </Tooltip>
      </ActionsStyled>
      <ConfirmedDialog
        open={confirmOpen}
        text={confirmText}
        alert={confirmText.includes('could not') ? 'error' : 'success'}
        setOpen={setConfirmOpen}
      />
    </Box>
  );
}
