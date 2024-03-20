import {
  InworldConnectionService,
  InworldTriggers,
  TriggerParameter,
} from '@inworld/web-core';
import {
  AddReaction,
  AutoAwesome,
  MoreVert,
  Send,
  Start,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import React, { useCallback, useState } from 'react';

import { INWORLD_COLORS } from '../helpers/colors';
import { CHAT_VIEW } from '../types';

const paramsPlaceholder =
  'Enter trigger params. Use JSON format such as [{"name":"value","value":"invalid"}]';

export interface AdditionalActionsProps {
  chatView: CHAT_VIEW;
  connection: InworldConnectionService;
  playWorkaroundSound: () => void;
}

export const AdditionalActions = (props: AdditionalActionsProps) => {
  const [el, setEl] = useState<HTMLButtonElement | null>(null);
  const [narration, setNarration] = useState('');
  const [narratedActionDialogOpen, setNarratedActionDialogOpen] =
    useState(false);
  const [trigger, setTrigger] = useState('');
  const [triggerParams, setTriggerParams] = useState('');
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);

  const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEl(event.currentTarget);
  };

  const onClose = () => {
    setEl(null);
  };

  const handleNarrationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNarration(e.target.value);
    },
    [],
  );

  const handleNarratedActionDialog = useCallback(() => {
    setNarratedActionDialogOpen(true);
  }, []);

  const handleSendNarration = useCallback(() => {
    if (narration) {
      props.playWorkaroundSound();

      props.connection?.sendNarratedAction(narration);

      setNarration('');
      setNarratedActionDialogOpen(false);
    }
  }, [props.connection, props.playWorkaroundSound, narration]);

  const handleTriggerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTrigger(e.target.value);
    },
    [],
  );

  const handleTriggerParamsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTriggerParams(e.target.value);
    },
    [],
  );

  const handleTriggerDialog = useCallback(() => {
    setTriggerDialogOpen(true);
  }, []);

  const handleSendTrigger = useCallback(() => {
    if (trigger) {
      let parameters: TriggerParameter[];

      try {
        parameters = JSON.parse(triggerParams);
      } catch (e) {
        console.warn('Invalid JSON format for trigger params');
        return;
      }

      props.playWorkaroundSound();
      props.connection?.sendTrigger(trigger, { parameters });

      setTrigger('');
      setTriggerParams('');
      setTriggerDialogOpen(false);
    }
  }, [props.connection, props.playWorkaroundSound, trigger, triggerParams]);

  const handleNextTurn = useCallback(() => {
    props.playWorkaroundSound();

    props.connection?.sendTrigger(InworldTriggers.MUTLI_AGENT_NEXT_TURN);

    setEl(null);
  }, [props.connection, props.playWorkaroundSound]);

  return (
    <>
      <IconButton
        onClick={onOpen}
        size="small"
        sx={{ color: INWORLD_COLORS.warmGray[50] }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

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
          <Box>
            <Tooltip title="Send narrated action" placement="left">
              <IconButton onClick={handleNarratedActionDialog}>
                <AddReaction fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send trigger" placement="left">
              <IconButton onClick={handleTriggerDialog}>
                <AutoAwesome fontSize="small" />
              </IconButton>
            </Tooltip>
            {props.chatView === CHAT_VIEW.MULTI_AGENT_TEXT ? (
              <Tooltip title="Next agents turn" placement="left">
                <IconButton onClick={handleNextTurn}>
                  <Start fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              ''
            )}
          </Box>
        </Stack>
      </Popover>

      <Dialog
        open={narratedActionDialogOpen}
        onClose={() => setNarratedActionDialogOpen(false)}
      >
        <DialogContent>
          <Box sx={{ m: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Narrated action"
              onChange={handleNarrationChange}
              placeholder="Enter action to narrate"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSendNarration}>
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={triggerDialogOpen}
        onClose={() => setTriggerDialogOpen(false)}
      >
        <DialogContent>
          <Box sx={{ m: 1 }}>
            <TextField
              sx={{ mb: 3 }}
              fullWidth
              size="small"
              label="Trigger name"
              onChange={handleTriggerChange}
              placeholder="Enter trigger name"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              sx={{ mb: 3 }}
              fullWidth
              size="small"
              label={paramsPlaceholder}
              onChange={handleTriggerParamsChange}
              placeholder="Enter trigger params"
              InputLabelProps={{ shrink: true }}
            />
            <Button onClick={handleSendTrigger} variant="contained">
              Send
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
