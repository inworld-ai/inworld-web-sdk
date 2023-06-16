import { AdditionalPhonemeInfo, EmotionEvent } from "@inworld/web-sdk";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Camera, Vector3 } from "three";
import { LinearProgress, Typography } from '@mui/material';
import { Skeleton } from '../skeleton/Skeleton';
import { Model } from './Model';
import { AnimationFile, ANIMATION_TYPE, EMOTIONS, EMOTIONS_FACE } from '../../types';

interface SceneProps {
    url: string;
    emotion: EMOTIONS;
    emotionFace: EMOTIONS_FACE;
    animationFiles: AnimationFile[];
    animationSequence: string[];
    phonemes: AdditionalPhonemeInfo[];
    emotionEvent?: EmotionEvent;
}

export default function Scene(props: SceneProps) {
  
    const [isLoaded, setIsLoaded] = useState(false);
    const [camera, setCamera] = useState(new PerspectiveCamera(7, window.innerWidth / window.innerHeight, 0.01, 1000));

    useEffect(() => {
      if (isLoaded) {
        console.log('Scene isLoaded');
        camera.position.set(0, 0.06, 0.2);
        camera.lookAt(new Vector3(0,0.007,0));
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
            <Canvas
                style={{ height: "100%", width: "100%" }}
                camera={camera}
                >
                {true && (
                    <Suspense fallback={null}>
                      <Model 
                          url={props.url}
                          animationFiles={props.animationFiles}
                          animationSequence={props.animationSequence}
                          emotion={props.emotion}
                          emotionFace={props.emotionFace}
                          phonemes={props.phonemes}
                          emotionEvent={props.emotionEvent}
                          onLoad={() => {
                              setIsLoaded(true)
                          }}
                      />
                    </Suspense>
                )}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 40, 10]} angle={0.15} penumbra={1} />
            </Canvas>
        </Suspense>
    </>
  );
}