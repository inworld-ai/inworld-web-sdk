import { HistoryItem, InworldConnectionService } from '@inworld/web-sdk';
import { CopyAll, Mic, Send, VolumeOff, VolumeUp } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useState } from 'react';

import { INWORLD_SESSION_STATE_KEY } from '../../defaults';
import { CHAT_VIEW, EmotionsMap } from '../types';
import { ActionsStyled, RecordIcon } from './Chat.styled';
import { ConfirmedDialog } from './ConfirmedDialog';
import { History } from './History';
import { SessionActions } from './SessionActions';

interface ChatProps {
  chatView: CHAT_VIEW;
  chatHistory: HistoryItem[];
  connection: InworldConnectionService;
  emotions: EmotionsMap;
  onRestore: (state: string) => Promise<void>;
  prevTranscripts: string[];
}

const RECORDING_STATUS = {
  STARTING: 'STARTING',
  RECORDING: 'RECORDING',
  STOPPED: 'STOPPED',
};

export function Chat(props: ChatProps) {
  const { chatHistory, connection } = props;

  const [text, setText] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recorderdingStatus, setRecorderdingStatus] = useState(
    RECORDING_STATUS.STOPPED,
  );
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

  const savedState = localStorage.getItem(INWORLD_SESSION_STATE_KEY);

  const handleCopyClick = useCallback(async () => {
    const history = [...props.prevTranscripts, connection.getTranscript()].join(
      '\n',
    );

    if (navigator.clipboard) {
      navigator.clipboard.writeText(history).then(() => {
        setConfirmText('Transcript successfully copied to clipboard');
      });
    } else {
      setConfirmText('Transcript successfully copied to console');
    }

    setConfirmOpen(true);
  }, [connection, chatHistory, props.prevTranscripts]);

  const handleClearStateClick = useCallback(() => {
    localStorage.removeItem(INWORLD_SESSION_STATE_KEY);
    setConfirmText('Session state successfully cleared from local storage');
    setConfirmOpen(true);
    INWORLD_SESSION_STATE_KEY;
  }, []);

  const handleSaveStateClick = useCallback(async () => {
    const sessionState = await connection.getSessionState();

    if (sessionState?.state) {
      localStorage.setItem(INWORLD_SESSION_STATE_KEY, sessionState.state);
      setConfirmText(
        'Session state successfully saved to local storage. Now you can restore it us the "Restore" button',
      );
    } else {
      setConfirmText('Session state could not be saved. Try again');
    }

    setConfirmOpen(true);
  }, [connection]);

  const handleRestoreStateClick = useCallback(async () => {
    if (savedState) {
      await props.onRestore(savedState);
      setConfirmText('Session state successfully restored from local storage');
    } else {
      setConfirmText('Session state could not be restored. Try again');
    }

    setConfirmOpen(true);
  }, [props.onRestore, savedState]);

  const handleMutePlayback = useCallback(() => {
    connection.recorder.initPlayback();
    connection.player.mute(!isPlaybackMuted);
    setIsPlaybackMuted(!isPlaybackMuted);
    connection.sendTTSPlaybackMute(!isPlaybackMuted);
  }, [connection, isPlaybackMuted]);

  const stopRecording = useCallback(() => {
    setRecorderdingStatus(RECORDING_STATUS.STOPPED);
    connection.recorder.stop();
    connection.sendAudioSessionEnd();
  }, [connection]);

  const startRecording = useCallback(async () => {
    try {
      setRecorderdingStatus(RECORDING_STATUS.STARTING);
      connection.sendAudioSessionStart();
      await connection.recorder.start();
      setRecorderdingStatus(RECORDING_STATUS.RECORDING);
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

    if (recorderdingStatus === RECORDING_STATUS.RECORDING) {
      return stopRecording();
    } else if (recorderdingStatus === RECORDING_STATUS.STOPPED) {
      return startRecording();
    }
  }, [
    connection,
    hasPlayedWorkaroundSound,
    recorderdingStatus,
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
          title={
            recorderdingStatus === RECORDING_STATUS.STOPPED
              ? 'Start speaking'
              : 'Stop speaking'
          }
          placement="top"
        >
          <span>
            <IconButton
              disabled={recorderdingStatus === RECORDING_STATUS.STARTING}
              onClick={handleSpeakClick}
              sx={{ height: '3rem', width: '3rem', backgroundColor: '#F1F5F9' }}
            >
              {recorderdingStatus === RECORDING_STATUS.STOPPED ? (
                <Mic />
              ) : (
                <RecordIcon />
              )}
            </IconButton>
          </span>
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
