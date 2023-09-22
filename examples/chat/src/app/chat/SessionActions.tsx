import { Delete, Restore, Save, Settings } from '@mui/icons-material';
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

export interface SessionActionsProps {
  onClear: () => void;
  onSave: () => void;
  onRestore: () => void;
  clearDisabled: boolean;
  saveDisabled: boolean;
  restoreDisabled: boolean;
}

export const SessionActions = (props: SessionActionsProps) => {
  const [settingsEl, setSettingsEl] = useState<HTMLButtonElement | null>(null);

  const onOpenSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsEl(event.currentTarget);
  };

  const onCloseSettings = () => {
    setSettingsEl(null);
  };

  return (
    <>
      <Tooltip title="Chat settings">
        <IconButton
          onClick={onOpenSettings}
          size="small"
          sx={{ color: INWORLD_COLORS.warmGray[50] }}
        >
          <Settings fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={!!settingsEl}
        anchorEl={settingsEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 150,
          horizontal: 'center',
        }}
        onClose={onCloseSettings}
      >
        <Stack sx={{ p: 2 }} spacing={2}>
          <Typography variant="h5">Session state</Typography>
          <Box>
            <Tooltip title="Save" placement="top">
              <span>
                <IconButton
                  onClick={() => {
                    props.onSave();
                    onCloseSettings();
                  }}
                  disabled={props.saveDisabled}
                >
                  <Save fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Restore" placement="top">
              <span>
                <IconButton
                  onClick={() => {
                    props.onRestore();
                    onCloseSettings();
                  }}
                  disabled={props.restoreDisabled}
                >
                  <Restore fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Clear" placement="top">
              <span>
                <IconButton
                  onClick={() => {
                    props.onClear();
                    onCloseSettings();
                  }}
                  disabled={props.clearDisabled}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};
