import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-core';
import { Box, Divider, Stack } from '@mui/material';

import { BODY_TEXTURE_TYPE } from '../../types';
import { AnimationFile } from './data/types';
import Scene from './Scene';

interface InnequinProps {
  animationFiles: AnimationFile[];
  animationSequence: string[];
  bodyTexture: BODY_TEXTURE_TYPE;
  emotionEvent?: EmotionEvent;
  phonemes: AdditionalPhonemeInfo[];
  visible: boolean;
  modelURI: string;
}

export function Innequin(props: InnequinProps) {
  return (
    <Stack
      className="innequin"
      direction="row"
      divider={<Divider orientation="vertical" flexItem />}
      spacing={1}
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        display: props.visible ? 'flex' : 'none',
        zIndex: '1',
      }}
    >
      <Box
        sx={{
          borderRadius: '1.75rem',
          backgroundColor: '#303030',
          width: '100%',
          height: '100%',
        }}
      >
        <Scene
          modelURI={props.modelURI}
          bodyTexture={props.bodyTexture}
          animationFiles={props.animationFiles}
          animationSequence={props.animationSequence}
          emotionEvent={props.emotionEvent}
          phonemes={props.phonemes}
        />
      </Box>
    </Stack>
  );
}
