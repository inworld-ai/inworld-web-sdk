import { useControls } from "leva";
import { useEffect } from "react";

import { EmotionBehaviorCode } from "@inworld/web-core";
import {
  BehaviorToBody,
  BehaviorToFacial,
  SkinType,
} from "@inworld/web-threejs";

export type RPMControlsProps = {
  emotion: EmotionBehaviorCode;
  // emotionInitial: string;
};

function RPMControls(props: RPMControlsProps) {
  // useEffect(() => {
  //   if (props.emotion) {
  //     set({
  //       Emotion: props.emotion,
  //       "Body Emotion": BehaviorToBody[props.emotion],
  //       "Facial Emotion": BehaviorToFacial[props.emotion],
  //     });
  //   }
  // }, [props.emotion]);

  // const [, set] = useControls("RPM", () => ({
  //   Emotion: {
  //     value: props.emotionInitial,
  //   },
  //   "Body Emotion": {
  //     value: BehaviorToBody[props.emotionInitial],
  //   },
  //   "Facial Emotion": {
  //     value: BehaviorToFacial[props.emotionInitial],
  //   },
  // }));

  return <></>;
}

export default RPMControls;
