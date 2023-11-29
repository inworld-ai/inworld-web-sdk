import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-core';
import { CircularProgress, LinearProgress, Typography } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';

import { Config } from '../../../config';
import { BODY_TEXTURE_TYPE } from '../../types';
import { Skeleton } from '../skeleton/Skeleton';
import { AnimationFile } from './data/types';
import { Model } from './Model';

interface SceneProps {
  modelURI: string;
  bodyTexture: BODY_TEXTURE_TYPE;
  animationFiles: AnimationFile[];
  animationSequence: string[];
  phonemes: AdditionalPhonemeInfo[];
  emotionEvent?: EmotionEvent;
}

export default function Scene(props: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [camera, setCamera] = useState(
    new PerspectiveCamera(
      Config.CAMERA_SETTINGS.FOV,
      window.innerWidth / window.innerHeight,
      Config.CAMERA_SETTINGS.NEAR,
      Config.CAMERA_SETTINGS.FAR,
    ),
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSpinner, setIsSpinner] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadProgressTotal, setLoadProgressTotal] = useState(33);

  useEffect(() => {
    if (isLoaded) {
      console.log('Scene isLoaded');
      camera.position.set(
        Config.CAMERA_SETTINGS.POS_X,
        Config.CAMERA_SETTINGS.POS_Y,
        Config.CAMERA_SETTINGS.POS_Z,
      );
      camera.lookAt(
        new Vector3(
          Config.CAMERA_SETTINGS.TAR_X,
          Config.CAMERA_SETTINGS.TAR_Y,
          Config.CAMERA_SETTINGS.TAR_Z,
        ),
      );
    }
  }, [isLoaded]);

  return (
    <>
      <Suspense
        fallback={
          <Skeleton>
            <Typography color="white">Loading</Typography>
          </Skeleton>
        }
      >
        <Canvas style={{ height: '100%', width: '100%' }} camera={camera}>
          {true && (
            <Suspense fallback={null}>
              <Model
                modelURI={props.modelURI}
                animationFiles={props.animationFiles}
                animationSequence={props.animationSequence}
                bodyTexture={props.bodyTexture}
                phonemes={props.phonemes}
                emotionEvent={props.emotionEvent}
                setIsSpinner={setIsSpinner}
                setLoadProgress={setLoadProgress}
                setLoadProgressTotal={setLoadProgressTotal}
                onLoad={() => {
                  setIsLoaded(true);
                }}
              />
            </Suspense>
          )}
          <ambientLight intensity={0.5} />
          <spotLight position={[-10, 40, 0]} angle={0.15} penumbra={1} />
        </Canvas>
        {!isLoaded && (
          <LinearProgress
            className="progressLoader"
            sx={{
              width: '70%',
              top: '-50%',
              left: '15%',
              zIndex: 1000,
            }}
            variant="buffer"
            value={loadProgress}
            valueBuffer={loadProgressTotal}
          />
        )}
        {isSpinner && (
          <CircularProgress
            sx={{
              width: '40px',
              height: '40px',
              top: '-50%',
              left: '50%',
              zIndex: 1000,
            }}
          />
        )}
      </Suspense>
    </>
  );
}
