import { Mic, RecordVoiceOver, SettingsVoice } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { INWORLD_COLORS } from '../helpers/colors';
import { RecordIcon } from './Chat.styled';

export interface RecorderActionsProps {
  disabled: boolean;
  recording: boolean;
  onStop: () => void;
  onGeneral: () => void;
  onPushToTalk: () => void;
  onSpeechRecognition: () => void;
}

export const RecorderActions = (props: RecorderActionsProps) => {
  const [el, setEl] = useState<HTMLButtonElement | null>(null);

  const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEl(event.currentTarget);
  };

  const onClose = () => {
    setEl(null);
  };

  return (
    <>
      <Tooltip title={props.recording ? 'Stop speaking' : 'Start speaking'}>
        <IconButton
          disabled={props.disabled}
          onClick={props.recording ? props.onStop : onOpen}
          size="small"
          sx={{ color: INWORLD_COLORS.warmGray[50] }}
        >
          {props.recording ? <RecordIcon /> : <Mic fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Popover
        open={!!el}
        anchorEl={el}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 150,
          horizontal: 'center',
        }}
        onClose={onClose}
      >
        <Stack sx={{ p: 2 }} spacing={2}>
          <Typography variant="h5">Mode</Typography>
          <Box>
            <Tooltip title="General" placement="top">
              <span>
                <IconButton
                  onClick={() => {
                    props.onGeneral();
                    onClose();
                  }}
                >
                  <Mic fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Push to talk" placement="top">
              <span>
                <IconButton
                  onClick={() => {
                    props.onPushToTalk();
                    onClose();
                  }}
                >
                  <SettingsVoice fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Speech recognition only" placement="top">
              <span>
                <IconButton
                  onClick={() => {
                    props.onSpeechRecognition();
                    onClose();
                  }}
                >
                  <RecordVoiceOver fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};
