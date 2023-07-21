import { AdditionalPhonemeInfo, EmotionEvent } from "@inworld/web-sdk";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Camera, Vector3 } from "three";
import { LinearProgress, Typography } from '@mui/material';
import { Skeleton } from '../skeleton/Skeleton';
import { Model } from './Model';
import { AnimationFile, BODY_TEXTURE_TYPE, EMOTIONS, EMOTIONS_FACE } from '../../types';

interface SceneProps {
    url: string;
    bodyTexture: BODY_TEXTURE_TYPE;
    emotion: EMOTIONS;
    emotionFace: EMOTIONS_FACE;
    animationFiles: AnimationFile[];
    animationSequence: string[];
    phonemes: AdditionalPhonemeInfo[];
    emotionEvent?: EmotionEvent;
}

export default function Scene(props: SceneProps) {
  
    const [camera, setCamera] = useState(new PerspectiveCamera(7, window.innerWidth / window.innerHeight, 0.01, 1000));
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [loadProgressTotal, setLoadProgressTotal] = useState(33);

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
                          bodyTexture={props.bodyTexture}
                          emotion={props.emotion}
                          emotionFace={props.emotionFace}
                          phonemes={props.phonemes}
                          emotionEvent={props.emotionEvent}
                          setLoadProgress={setLoadProgress}
                          setLoadProgressTotal={setLoadProgressTotal}
                          onLoad={() => {
                              setIsLoaded(true)
                          }}
                      />
                    </Suspense>
                )}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 40, 10]} angle={0.15} penumbra={1} />
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
                variant="buffer" value={loadProgress} valueBuffer={loadProgressTotal} 
              />
            )}
        </Suspense>
    </>
  );
}