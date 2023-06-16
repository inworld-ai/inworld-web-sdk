import { Box, Button, Divider, Stack } from '@mui/material';

import { EMOTIONS, EMOTIONS_FACE } from '../types';

interface ControlBarProps {
  emotion: EMOTIONS;
  emotionFace: EMOTIONS_FACE;
  setEmotion: Function;
  setEmotionFace: Function;
  visible: boolean;
}

export default function ControlBar(props: ControlBarProps) {
  return (
    <>
      <Stack
        className="controlBar"
        direction="column"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={1}
        sx={{
          backgroundColor: "white",
          position: 'absolute',
          left: 0,
          display: props.visible ? 'flex' : 'none',
          zIndex: '1000',
        }}
      >
        <p>Body</p>
        <Button variant="outlined" onClick={() => props.setEmotion(EMOTIONS.NEUTRAL)}>Neutral</Button>
        <Button variant="outlined" onClick={() => props.setEmotion(EMOTIONS.ANGRY)}>Angry</Button>
        <Button variant="outlined" onClick={() => props.setEmotion(EMOTIONS.HAPPY)}>Happy</Button>
        <Button variant="outlined" onClick={() => props.setEmotion(EMOTIONS.SAD)}>Sad</Button>
        <p>Face</p>
        <Button variant="outlined" onClick={() => props.setEmotionFace(EMOTIONS_FACE.NEUTRAL)}>Neutral</Button>
        <Button variant="outlined" onClick={() => props.setEmotionFace(EMOTIONS_FACE.AFFECTION)}>Affection</Button>
        <Button variant="outlined" onClick={() => props.setEmotionFace(EMOTIONS_FACE.ANGRY)}>Angry</Button>
        <Button variant="outlined" onClick={() => props.setEmotionFace(EMOTIONS_FACE.FEAR)}>Fear</Button>
        <Button variant="outlined" onClick={() => props.setEmotionFace(EMOTIONS_FACE.HUMOR)}>Humor</Button>
        <Button variant="outlined" onClick={() => props.setEmotionFace(EMOTIONS_FACE.JOY)}>Joy</Button>
        <Button variant="outlined" onClick={() => props.setEmotionFace(EMOTIONS_FACE.SAD)}>Sad</Button>
      </Stack>
    </>
  )
}