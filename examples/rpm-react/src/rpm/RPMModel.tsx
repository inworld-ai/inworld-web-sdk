import { useControls } from "leva";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmotionBehaviorCode } from "@inworld/web-core";
import { RPM, RPMConfiguration, SkinType } from "@inworld/web-threejs";
import { useFrame } from "@react-three/fiber";

import { useInworld } from "../contexts/InworldProvider";
import { useSystem } from "../contexts/SystemProvider";
import { config } from "../utils/config";
import RPMControls from "./RPMControls";

function RPMModel() {
  const [emotion, setEmotion] = useState<EmotionBehaviorCode>(null!);
  const [isLoaded, setIsLoaded] = useState(false);

  const rpmRef = useRef<RPM>(null!);

  const { setLoading, setLoadingPercent } = useSystem();
  const { emotionEvent, open, phonemes } = useInworld();

  useEffect(() => {
    if (!isLoaded && !rpmRef.current) {
      rpmRef.current = new RPM({
        ...config.rpm,
        onLoad: onLoadRPM,
        onProgress: onProgressRPM,
      });
      open();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (emotionEvent) {
      setEmotion(emotionEvent.behavior.code);
    }
  }, [emotionEvent]);

  useEffect(() => {
    if (isLoaded && emotionEvent) {
      rpmRef.current.setEmotion(emotionEvent.behavior.code);
    }
  }, [isLoaded, emotionEvent]);

  useEffect(() => {
    if (isLoaded && phonemes) {
      rpmRef.current.setPhonemes(phonemes);
    }
  }, [isLoaded, phonemes]);

  const onLoadRPM = useCallback(
    (config: RPMConfiguration) => {
      console.log("RPMModel:", config);
      if (rpmRef.current && rpmRef.current.getModel()) {
        rpmRef.current.getModel().position.set(0, 0, 0);
        setIsLoaded(true);
        setLoading!(false);
      }
    },
    [rpmRef.current]
  );

  const onProgressRPM = useCallback(
    (progress: number) => {
      // console.log("Scene onProgressRPM", progress);
      if (setLoadingPercent) setLoadingPercent(progress);
    },
    [setLoadingPercent]
  );

  useFrame((state, delta) => {
    if (rpmRef.current) {
      rpmRef.current.updateFrame(delta);
    }
  });

  return (
    <>
      {isLoaded && (
        <>
          <RPMControls emotion={emotion} />
          <primitive
            object={rpmRef.current.getModel()}
            castShadow
            receiveShadow
          />
        </>
      )}
    </>
  );
}

export default RPMModel;
