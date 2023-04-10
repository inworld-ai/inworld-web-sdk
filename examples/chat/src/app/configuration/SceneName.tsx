import { Box, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { Configuration } from '../types';
import { save as saveConfiguration } from '../helpers/configuration';
import { useCallback, useMemo } from 'react';

const FIELD_NAME = 'scene.name';
export const RESOURCE_NAME_PATTERN = RegExp(
  `^workspaces/([a-z0-9_-]+)/(characters|scenes)/([a-z0-9_-]+)$`,
);

export const SceneName = () => {
  const { getValues, formState, register, setValue } =
    useFormContext<Configuration>();

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(FIELD_NAME, event.target.value);
      saveConfiguration(getValues());
    },
    [getValues, setValue],
  );

  const errorMessage = useMemo(
    () => formState.errors?.scene?.name?.message,
    [formState],
  );

  return (
    <Box sx={{ m: 2 }}>
      <TextField
        fullWidth
        id="scene-name"
        size="small"
        label="Scene Resource Name"
        placeholder="Enter scene resource name"
        InputLabelProps={{ shrink: true }}
        {...{ error: !!errorMessage, helperText: errorMessage }}
        {...register(FIELD_NAME, {
          onChange,
          required: 'This field is required',
          pattern: {
            value: RESOURCE_NAME_PATTERN,
            message: 'Please use resource name',
          },
        })}
      />
    </Box>
  );
};
