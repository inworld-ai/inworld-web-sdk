import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';

import { CHAT_VIEW } from '../types';
import { Audio } from './Audio';
import { CharacterName } from './CharacterName';
import { ChatView } from './ChatView';
import { PlayerName } from './PlayerName';
import { SceneName } from './SceneName';
import { SessionContinuation } from './SessionContinuation';

interface ConfigViewProps {
  chatView?: CHAT_VIEW;
  canStart: boolean;
  onStart: () => Promise<void>;
  onResetForm: () => void;
}

export const ConfigView = (props: ConfigViewProps) => {
  return (
    <>
      <Box component="form">
        <Typography variant="h3" component="h1" sx={{ m: 1 }}>
          Chat with Inworld character
        </Typography>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <ChatView />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {props.chatView === CHAT_VIEW.MULTI_AGENT_TEXT ? (
                  <SceneName />
                ) : (
                  <CharacterName />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <PlayerName />
              </Grid>
            </Grid>
            {[CHAT_VIEW.TEXT, CHAT_VIEW.MULTI_AGENT_TEXT].includes(
              props.chatView!,
            ) && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Audio />
                </Grid>
              </Grid>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <SessionContinuation />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <Grid
        container
        mt={1}
        spacing={2}
        alignItems="center"
        justifyContent={'flex-end'}
      >
        <Grid item>
          <Button
            sx={{ mr: 2 }}
            variant="contained"
            onClick={props.onResetForm}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            disabled={!props.canStart}
            onClick={props.onStart}
          >
            Start
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
