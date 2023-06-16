/* eslint-disable */
import { AdditionalPhonemeInfo, EmotionEvent } from "@inworld/web-sdk";
import { useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import { AnimationClip, AnimationMixer, Clock, MathUtils, SkinnedMesh, Object3D, MeshPhysicalMaterial } from "three";
import { AnimationLoader } from "./loaders/AnimationLoader";
import { AnimationsLoader } from "./loaders/AnimationsLoader";
import { Animator } from "./animator/Animator";
// import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Visemes } from '../../../data/visemes';

import { ListChildren } from '../../helpers/helpers3D';
import { AnimationFile, 
  ANIMATION_TYPE, 
  EMOTIONS, 
  EMOTIONS_FACE, 
  FACE_TEXTURE_TYPES, 
  FACE_TYPES, 
  TEXTURE_TYPES, 
  MATERIAL_TYPES, 
  VISEME_TYPES} from '../../types';

import { Config } from '../../../config';
import { MaterialLoader } from "./loaders/MaterialLoader";
import { MaterialsLoader } from "./loaders/MaterialsLoader";

interface ModelProps {
  url: string;
  emotion: EMOTIONS;
  emotionFace: EMOTIONS_FACE;
  animationFiles: AnimationFile[];
  animationSequence: string[];
  onLoad?: () => void;
  phonemes: AdditionalPhonemeInfo[];
  emotionEvent?: EmotionEvent;
}

export function Model(props: ModelProps) {

  const modelData = useLoader(GLTFLoader, props.url);
  const modelRef = useRef(modelData);

  const [isAnimationsLoaded, setIsAnimationsLoaded] = useState(false);
  const [isFacialMaterialsLoaded, setIsFacialMaterialsLoaded] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [animationClips, setAnimationClips] = useState<{
    [key: string]: AnimationClip | null;
  }>({});

  const [animationFiles, setAnimationFiles] = useState<{
    [key: string]: AnimationLoader | null;
  }>({});

  const [facialMaterials, setFacialMaterials] = useState<{
    [key: string]: MaterialLoader | null;
  }>({});

  const [facialMeshes, setFacialMeshes] = useState<{
    [key: string]: SkinnedMesh | null;
  }>({});

  // 1. Model Loading Completed
  useEffect(() => {
    if (!isModelLoaded && modelData) {
      console.log('Model Loaded');
      modelRef.current = modelData;
      const loadingFacialMeshes = { ...facialMeshes };
      loadingFacialMeshes[FACE_TYPES.BROW] = modelData.scene.children[0].children[0].children[2].children[0] as SkinnedMesh;
      loadingFacialMeshes[FACE_TYPES.EYE] = modelData.scene.children[0].children[0].children[2].children[1] as SkinnedMesh;
      loadingFacialMeshes[FACE_TYPES.MOUTH] = modelData.scene.children[0].children[0].children[2].children[2] as SkinnedMesh;
      loadingFacialMeshes[FACE_TYPES.NOSE] = modelData.scene.children[0].children[0].children[2].children[3] as SkinnedMesh;
      setFacialMeshes(loadingFacialMeshes);
      setIsModelLoaded(true);
    }
  }, [modelData, isModelLoaded]);

  // 2. Init Loading Animation Files
  useEffect(() => {
    if (isModelLoaded && !isAnimationsLoaded && Object.keys(animationFiles).length === 0 && !isReady) {
      const loadingAnimationFiles = { ...animationFiles };
      for (const animation of props.animationFiles) {
        loadingAnimationFiles[animation.name.toLowerCase()] = new AnimationLoader(animation);
      }
      setAnimationFiles(loadingAnimationFiles);
    }
  }, [isModelLoaded, isAnimationsLoaded, animationFiles, isReady]);

  // 3. Load Animation Files
  useEffect(() => {
    if (isModelLoaded && !isAnimationsLoaded && Object.keys(animationFiles).length > 0 && !isReady) {
      const animationsLoader = new AnimationsLoader(animationFiles, () => setIsAnimationsLoaded(true));
    }
  }, [isModelLoaded, isAnimationsLoaded, animationFiles, isReady]);

  // 4. Animations Loading Completed
  useEffect(() => {
    if (isModelLoaded && isAnimationsLoaded && !isFacialMaterialsLoaded && !isReady) {
      console.log('Animations Loaded');
      const loadingAnimationClips = { ...animationClips };
      for (const i in animationFiles) {
        loadingAnimationClips[animationFiles[i]!.animation.name] = animationFiles[i]!.animationClip!;
      }
      setAnimationClips(loadingAnimationClips);      
    }
  }, [animationFiles, isAnimationsLoaded, isFacialMaterialsLoaded, isModelLoaded, isReady]);

  
  // 5. Init Loading Material Files
  useEffect(() => {
    if (isModelLoaded && !isFacialMaterialsLoaded && Object.keys(facialMaterials).length === 0 && !isReady) {
      const loadingFacialMaterials = { ...facialMaterials };
      Object.values(EMOTIONS_FACE).forEach((valueEmotionType) => {
        Object.values(FACE_TEXTURE_TYPES).forEach((valueFaceType) => {
          // console.log('Loading: ' + valueEmotionType + " " + valueFaceType);
          loadingFacialMaterials[valueEmotionType + "_" + valueFaceType + "_" + MATERIAL_TYPES.FEATURE] = new MaterialLoader(valueEmotionType, valueFaceType, MATERIAL_TYPES.FEATURE);
          if (valueFaceType == FACE_TEXTURE_TYPES.MOUTH) {
            Object.values(VISEME_TYPES).forEach((valueVisemeType) => {
              // console.log('Loading: ' + valueEmotionType + " " + valueVisemeType);
              loadingFacialMaterials[valueEmotionType + "_" + valueVisemeType + "_" + MATERIAL_TYPES.VISEME] = new MaterialLoader(valueEmotionType, valueFaceType, MATERIAL_TYPES.VISEME, valueVisemeType);
            });
          }
        });
      });
      setFacialMaterials(loadingFacialMaterials);  
    }
  }, [isModelLoaded, isFacialMaterialsLoaded, facialMaterials, isReady]);

  // 6. Load Material Files
  useEffect(() => {
    if (isModelLoaded && !isFacialMaterialsLoaded && Object.keys(facialMaterials).length > 0 && !isReady) {
      const materialsLoader = new MaterialsLoader(facialMaterials, () => setIsFacialMaterialsLoaded(true));
    }
  }, [isModelLoaded, isFacialMaterialsLoaded, facialMaterials, isReady]);

  // 7. Materials Loading Completed
  useEffect(() => {
    if (isModelLoaded && isAnimationsLoaded && isFacialMaterialsLoaded && !isReady) {
      console.log('Materials Loaded');
      setIsReady(true);
      props.onLoad?.();
    }
  }, [isModelLoaded, isAnimationsLoaded, isFacialMaterialsLoaded, isReady]);


  return (
    <>
      {isReady && (
        <Suspense fallback={null}>
          <primitive object={modelData.scene} />
          <Animator 
            animationClips={animationClips}
            animationSequence={props.animationSequence}
            emotion={props.emotion}
            emotionEvent={props.emotionEvent}
            emotionFace={props.emotionFace}
            facialMaterials={facialMaterials}
            facialMeshes={facialMeshes}
            isReady={isReady} 
            isModelLoaded={isModelLoaded} 
            model={modelData.scene.children[0]} 
            phonemes={props.phonemes} />
        </Suspense>
      )}
    </>
  );
}
