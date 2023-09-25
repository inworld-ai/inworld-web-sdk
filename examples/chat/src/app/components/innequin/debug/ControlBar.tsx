import { Button, Divider, Stack } from '@mui/material';

import { Skins } from '../data/skins';

interface ControlBarProps {
  setBodyTexture: Function;
  visible: boolean;
}

export default function ControlBar(props: ControlBarProps) {
  return (
    <>
      <Stack
        className="controlBar"
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={1}
        sx={{
          backgroundColor: 'white',
          position: 'absolute',
          left: 0,
          display: props.visible ? 'flex' : 'none',
          zIndex: '1000',
        }}
      >
        {/* <Stack
          direction="column"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={1}
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
        </Stack> */}
        <Stack
          direction="column"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={1}
        >
          <p>Body Skin</p>
          {Skins.map((skin) => {
            return (
              <Button
                key={skin.name}
                variant="outlined"
                onClick={() => props.setBodyTexture(skin.name)}
              >
                {skin.name}
              </Button>
            );
          })}
        </Stack>
      </Stack>
    </>
  );
}
