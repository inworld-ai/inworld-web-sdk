import { RPM, RPMConfiguration } from '@inworld/web-threejs';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useInworld } from '../contexts/InworldProvider';
import { useSystem } from '../contexts/SystemProvider';
import { config } from '../utils/config';

function RPMModel() {
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
      console.log('RPMModel:', config);
      if (rpmRef.current && rpmRef.current.getModel()) {
        rpmRef.current.getModel().position.set(0, 0, 0);
        setIsLoaded(true);
        setLoading!(false);
      }
    },
    [rpmRef.current],
  );

  const onProgressRPM = useCallback(
    (progress: number) => {
      if (setLoadingPercent) setLoadingPercent(progress);
    },
    [setLoadingPercent],
  );

  useFrame((_, delta) => {
    if (rpmRef.current) {
      rpmRef.current.updateFrame(delta);
    }
  });

  return (
    <>
      {isLoaded && (
        <>
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
