import { Box, Grid, TextField } from '@mui/material';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { save as saveConfiguration } from '../helpers/configuration';
import { ConfigurationSession } from '../types';

export const Audio = () => {
  const { getValues, register, setValue } =
    useFormContext<ConfigurationSession>();

  const onChange = useCallback(() => {
    saveConfiguration(getValues());
  }, [getValues, setValue]);

  return (
    <Grid container>
      <Grid item xs={12} sm={6}>
        <Box sx={{ m: 2 }}>
          <TextField
            fullWidth
            id="stop-duration"
            size="small"
            label="Playback stop duration (in ms)"
            placeholder="Enter playback stop duration"
            InputLabelProps={{ shrink: true }}
            {...register('audio.stopDuration', { onChange })}
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box sx={{ m: 2 }}>
          <TextField
            fullWidth
            id="stop-ticks"
            size="small"
            label="Playback stop ticks"
            placeholder="Enter playback ticks"
            InputLabelProps={{ shrink: true }}
            {...register('audio.stopTicks', { onChange })}
          />
        </Box>
      </Grid>
    </Grid>
  );
};
