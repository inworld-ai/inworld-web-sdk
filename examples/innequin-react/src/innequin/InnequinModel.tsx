import { EmotionBehaviorCode } from '@inworld/web-core';
import {
  Innequin,
  InnequinConfiguration,
  SkinType,
} from '@inworld/web-threejs';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useInworld } from '../contexts/InworldProvider';
import { useSystem } from '../contexts/SystemProvider';
import { config } from '../utils/config';
import InnequinControls from './InnequinControls';

function InnequinModel() {
  const [defaultEmotion, setDefaultEmotion] = useState<EmotionBehaviorCode>(
    null!,
  );
  const [emotion, setEmotion] = useState<EmotionBehaviorCode>(null!);
  const [isLoaded, setIsLoaded] = useState(false);
  const [skins, setSkins] = useState<{ [key: string]: SkinType }>(null!);

  const innequinRef = useRef<Innequin>(null!);
  const initSkinRef = useRef('WOOD1');

  const { setLoading, setLoadingPercent } = useSystem();
  const { emotionEvent, open, phonemes } = useInworld();

  useEffect(() => {
    if (!isLoaded && !innequinRef.current) {
      innequinRef.current = new Innequin({
        ...config.innequin,
        skinName: initSkinRef.current,
        onLoad: onLoadInnequin,
        onProgress: onProgressInnequin,
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
      innequinRef.current.setEmotion(emotionEvent.behavior.code);
    }
  }, [isLoaded, emotionEvent]);

  useEffect(() => {
    if (isLoaded && phonemes) {
      innequinRef.current.setPhonemes(phonemes);
    }
  }, [isLoaded, phonemes]);

  const onLoadInnequin = useCallback(
    (config: InnequinConfiguration) => {
      if (innequinRef.current && innequinRef.current.getModel()) {
        setSkins(config.innequin.skins);
        setDefaultEmotion(config.innequin.defaults.EMOTION);
        innequinRef.current.getModel().position.set(0, 0, 0);
        setIsLoaded(true);
        setLoading!(false);
      }
    },
    [innequinRef.current],
  );

  const onProgressInnequin = useCallback(
    (progress: number) => {
      if (setLoadingPercent) setLoadingPercent(progress);
    },
    [setLoadingPercent],
  );

  useFrame((state, delta) => {
    if (innequinRef.current) {
      innequinRef.current.updateFrame(delta);
    }
  });

  return (
    <>
      {isLoaded && (
        <>
          {skins && initSkinRef.current && (
            <InnequinControls
              skins={skins}
              skinNameInitial={initSkinRef.current}
              onChangeSkin={(skinName: string) => {
                if (innequinRef.current) {
                  innequinRef.current.setSkin(skinName);
                }
              }}
              emotion={emotion}
              emotionInitial={defaultEmotion}
            />
          )}
          <primitive
            object={innequinRef.current.getModel()}
            castShadow
            receiveShadow
          />
        </>
      )}
    </>
  );
}

export default InnequinModel;
