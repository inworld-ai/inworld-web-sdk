import { EmotionBehaviorCode } from '@inworld/web-core';
import {
  InnequinBehaviorToBody,
  InnequinBehaviorToFacial,
  SkinType,
} from '@inworld/web-threejs';
import { useControls } from 'leva';
import { useEffect } from 'react';

export type InnequinControlsProps = {
  skins: { [key: string]: SkinType };
  skinNameInitial: string;
  onChangeSkin: (skinName: string) => void;
  emotion: EmotionBehaviorCode;
  emotionInitial: string;
};

function InnequinControls(props: InnequinControlsProps) {
  useEffect(() => {
    if (props.emotion) {
      set({
        Emotion: props.emotion,
        'Body Emotion': InnequinBehaviorToBody[props.emotion],
        'Facial Emotion': InnequinBehaviorToFacial[props.emotion],
      });
    }
  }, [props.emotion]);

  const [, set] = useControls('Innequin', () => ({
    Skin: {
      options: Object.keys(props.skins),
      value: props.skinNameInitial,
      onChange: (skinName) => props.onChangeSkin(skinName),
    },
    Emotion: {
      value: props.emotionInitial,
    },
    'Body Emotion': {
      value: InnequinBehaviorToBody[props.emotionInitial],
    },
    'Facial Emotion': {
      value: InnequinBehaviorToFacial[props.emotionInitial],
    },
  }));

  return <></>;
}

export default InnequinControls;
