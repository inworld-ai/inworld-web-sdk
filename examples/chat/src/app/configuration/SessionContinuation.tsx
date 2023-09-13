import { TextareaAutosize } from '@mui/base';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import { Controller, useFormContext } from 'react-hook-form';

import { configuration } from '../../defaults';
import { save as saveConfiguration } from '../helpers/configuration';
import { ConfigurationSession } from '../types';

const { previousDialog: defaultValue } = configuration.continuation;

export const SessionContinuation = () => {
  const { control, getValues, setValue, watch } =
    useFormContext<ConfigurationSession>();
  const enabled = watch('continuation.enabled');

  const blue = {
    200: '#b6daff',
    400: '#3399FF',
    500: '#007FFF',
  };

  const grey = {
    50: '#f6f8fa',
    200: '#d0d7de',
    300: '#afb8c1',
    500: '#6e7781',
    700: '#424a53',
    900: '#24292f',
  };

  const StyledTextarea = styled(TextareaAutosize)(
    ({ theme }) => `
    width: 320px;
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 12px 12px 0 12px;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${
      theme.palette.mode === 'dark' ? grey[900] : grey[50]
    };
  
    &:hover {
      border-color: ${blue[400]};
    }
  
    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
        theme.palette.mode === 'dark' ? blue[500] : blue[200]
      };
    }
  
    // firefox
    &:focus-visible {
      outline: 0;
    }
  `,
  );

  return (
    <Box sx={{ m: 2 }}>
      <FormControlLabel
        label="Use Previous Dialog"
        control={
          <Controller
            name="continuation.enabled"
            control={control}
            render={({ field: { value } }) => {
              const val = value ?? false;

              return (
                <Switch
                  checked={val}
                  onChange={async (_, checked) => {
                    setValue('continuation.enabled', checked);
                    setValue(
                      'continuation.previousDialog',
                      checked ? defaultValue : '',
                    );

                    saveConfiguration(getValues());
                  }}
                />
              );
            }}
          />
        }
      />
      <Tooltip title={`Should be JSON like ${defaultValue}`}>
        <IconButton>
          <InfoIcon />
        </IconButton>
      </Tooltip>
      {enabled && (
        <Box>
          <FormControlLabel
            label=""
            control={
              <Controller
                name="continuation.previousDialog"
                control={control}
                render={({ field: { value } }) => {
                  const val = value ?? defaultValue;

                  return (
                    <StyledTextarea
                      minRows={3}
                      value={val}
                      placeholder={defaultValue}
                      onChange={(event) => {
                        setValue(
                          'continuation.previousDialog',
                          event.target.value,
                        );
                        saveConfiguration(getValues());
                      }}
                    />
                  );
                }}
              />
            }
          />
        </Box>
      )}
    </Box>
  );
};
