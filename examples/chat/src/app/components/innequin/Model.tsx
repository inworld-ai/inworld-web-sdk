import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-core';
import { useLoader } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimationClip, MeshPhysicalMaterial, SkinnedMesh } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { BODY_TEXTURE_TYPE, VISEME_TYPES } from '../../types';
import { Config } from './../../../config';
import { Animator } from './animator/Animator';
import {
  ANIMATION_TYPE,
  AnimationFile,
  AnimationGesture,
  EMOTIONS_FACE,
  FACE_TEXTURE_TYPES,
  MATERIAL_TYPES,
  MESH_TYPES,
} from './data/types';
import { AnimationLoader } from './loaders/AnimationLoader';
import { AnimationsLoader } from './loaders/AnimationsLoader';
import { BodyMaterialLoader } from './loaders/BodyMaterialLoader';
import { FaceMaterialLoader } from './loaders/FaceMaterialLoader';
import { MaterialsLoader } from './loaders/MaterialsLoader';

interface ModelProps {
  modelURI: string;
  bodyTexture: BODY_TEXTURE_TYPE;
  animationFiles: AnimationFile[];
  animationSequence: string[];
  onLoad?: () => void;
  phonemes: AdditionalPhonemeInfo[];
  emotionEvent?: EmotionEvent;
  setIsSpinner: Function;
  setLoadProgress: Function;
  setLoadProgressTotal: Function;
}

export function Model(props: ModelProps) {
  const bodyTextureRef = useRef(props.bodyTexture);
  const modelData = useLoader(GLTFLoader, props.modelURI, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(Config.DRACO_COMPRESSION_URI);
    loader.setDRACOLoader(dracoLoader);
  });
  const modelRef = useRef(modelData);

  const [isAnimationsLoaded, setIsAnimationsLoaded] = useState(false);
  const [isFacialMaterialsLoaded, setIsFacialMaterialsLoaded] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPlaying, setIsPlaying] = useState(false);
  const [bodyMaterialLoading, setBodyMaterialLoading] = useState(false);

  const [animationClips, setAnimationClips] = useState<{
    [key: string]: AnimationClip | null;
  }>({});

  const [animationFiles, setAnimationFiles] = useState<{
    [key: string]: AnimationLoader | null;
  }>({});

  const [animationGestures, setAnimationGestures] = useState<
    AnimationGesture[]
  >([]);

  const [bodyMaterials, setBodyMaterials] = useState<{
    [key: string]: BodyMaterialLoader | null;
  }>({});

  const [facialMaterials, setFacialMaterials] = useState<{
    [key: string]: FaceMaterialLoader | null;
  }>({});

  const [modelMeshes, setModelMeshes] = useState<{
    [key: string]: SkinnedMesh | null;
  }>({});

  // 1. Model Loading Completed
  useEffect(() => {
    if (!isModelLoaded && modelData) {
      console.log('Model Loaded');
      modelRef.current = modelData;
      const loadingModelMeshes = { ...modelMeshes };
      const skeleton = modelData.scene.children[0].children.find(
        (item) => item.name === 'skeleton',
      );
      console.log(`Mesh Count`, modelData.scene.children[0].children);
      loadingModelMeshes[MESH_TYPES.BROW] = skeleton?.children.find(
        (item) => item.name === 'faceLayer_brows_geo',
      ) as SkinnedMesh;
      loadingModelMeshes[MESH_TYPES.EYE] = skeleton?.children.find(
        (item) => item.name === 'faceLayer_eyes_geo',
      ) as SkinnedMesh;
      loadingModelMeshes[MESH_TYPES.MOUTH] = skeleton?.children.find(
        (item) => item.name === 'faceLayer_mouth_geo',
      ) as SkinnedMesh;
      loadingModelMeshes[MESH_TYPES.NOSE] = skeleton?.children.find(
        (item) => item.name === 'faceLayer_nose_geo',
      ) as SkinnedMesh;
      loadingModelMeshes[MESH_TYPES.BODY_ARMS] = skeleton?.children.find(
        (item) => item.name === 'Mannequin_Arms',
      ) as SkinnedMesh;
      loadingModelMeshes[MESH_TYPES.BODY_HEAD] = skeleton?.children.find(
        (item) => item.name === 'Mannequin_Head_03',
      ) as SkinnedMesh;
      loadingModelMeshes[MESH_TYPES.BODY_LEGS] = skeleton?.children.find(
        (item) => item.name === 'Mannequin_Legs',
      ) as SkinnedMesh;
      loadingModelMeshes[MESH_TYPES.BODY_TORSO] = skeleton?.children.find(
        (item) => item.name === 'Mannequin_Body',
      ) as SkinnedMesh;
      props.setLoadProgress(33);
      props.setLoadProgressTotal(66);
      setModelMeshes(loadingModelMeshes);
      setIsModelLoaded(true);
    }
  }, [modelData, isModelLoaded]);

  // 2. Init Loading Animation Files
  useEffect(() => {
    if (
      isModelLoaded &&
      !isAnimationsLoaded &&
      Object.keys(animationFiles).length === 0 &&
      !isReady
    ) {
      const loadingAnimationFiles = { ...animationFiles };
      for (const animation of props.animationFiles) {
        loadingAnimationFiles[animation.name.toLowerCase()] =
          new AnimationLoader(animation);
      }
      setAnimationFiles(loadingAnimationFiles);
    }
  }, [isModelLoaded, isAnimationsLoaded, animationFiles, isReady]);

  // 3. Load Animation Files
  useEffect(() => {
    if (
      isModelLoaded &&
      !isAnimationsLoaded &&
      Object.keys(animationFiles).length > 0 &&
      !isReady
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const animationsLoader = new AnimationsLoader(
        animationFiles,
        () => setIsAnimationsLoaded(true),
        33,
        66,
        props.setLoadProgress,
      );
    }
  }, [isModelLoaded, isAnimationsLoaded, animationFiles, isReady]);

  // 4. Animations Loading Completed. Process clips and gesture data.
  useEffect(() => {
    if (
      isModelLoaded &&
      animationFiles &&
      isAnimationsLoaded &&
      !isFacialMaterialsLoaded &&
      !isReady
    ) {
      console.log('Animations Loaded');
      const loadingAnimationClips = { ...animationClips };
      const loadingAnimationGestures = [...animationGestures];
      // console.log('animationFiles', animationFiles);
      for (const i in animationFiles) {
        loadingAnimationClips[animationFiles[i]!.animation.name] =
          animationFiles[i]!.animationClip!;
        // console.log('Animations Duration', animationFiles[i]!.animationClip!.name, animationFiles[i]!.animationClip!.duration);
        if (animationFiles[i]!.animation.type == ANIMATION_TYPE.GESTURE) {
          const animationGesture: AnimationGesture = {
            name: animationFiles[i]!.animation.name,
            duration: animationFiles[i]!.animationClip!.duration,
            emotion: animationFiles[i]!.animation.emotion,
          };
          loadingAnimationGestures.push(animationGesture);
        }
      }
      props.setLoadProgress(66);
      props.setLoadProgressTotal(100);
      setAnimationGestures(loadingAnimationGestures);
      setAnimationClips(loadingAnimationClips);
    }
  }, [
    animationFiles,
    isAnimationsLoaded,
    isFacialMaterialsLoaded,
    isModelLoaded,
    isReady,
  ]);

  // 5. Init Loading Material Files
  useEffect(() => {
    if (
      isModelLoaded &&
      isAnimationsLoaded &&
      !isFacialMaterialsLoaded &&
      Object.keys(facialMaterials).length === 0 &&
      !isReady
    ) {
      const loadingFacialMaterials = { ...facialMaterials };
      Object.values(EMOTIONS_FACE).forEach((valueEmotionType) => {
        Object.values(FACE_TEXTURE_TYPES).forEach((valueFaceType) => {
          // console.log('Loading: ' + valueEmotionType + " " + valueFaceType);
          loadingFacialMaterials[
            valueEmotionType +
              '_' +
              valueFaceType +
              '_' +
              MATERIAL_TYPES.FEATURE
          ] = new FaceMaterialLoader(
            valueEmotionType,
            valueFaceType,
            MATERIAL_TYPES.FEATURE,
          );
          if (valueFaceType == FACE_TEXTURE_TYPES.MOUTH) {
            Object.values(VISEME_TYPES).forEach((valueVisemeType) => {
              // console.log('Loading: ' + valueEmotionType + " " + valueVisemeType);
              loadingFacialMaterials[
                valueEmotionType +
                  '_' +
                  valueVisemeType +
                  '_' +
                  MATERIAL_TYPES.VISEME
              ] = new FaceMaterialLoader(
                valueEmotionType,
                valueFaceType,
                MATERIAL_TYPES.VISEME,
                valueVisemeType,
              );
            });
          }
        });
      });
      setFacialMaterials(loadingFacialMaterials);
    }
  }, [
    isModelLoaded,
    isAnimationsLoaded,
    isFacialMaterialsLoaded,
    facialMaterials,
    isReady,
  ]);

  // 6. Load Material Files
  useEffect(() => {
    if (
      isModelLoaded &&
      isAnimationsLoaded &&
      !isFacialMaterialsLoaded &&
      Object.keys(facialMaterials).length > 0 &&
      !isReady
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const materialsLoader = new MaterialsLoader(
        facialMaterials,
        () => setIsFacialMaterialsLoaded(true),
        66,
        100,
        props.setLoadProgress,
      );
    }
  }, [
    isModelLoaded,
    isAnimationsLoaded,
    isFacialMaterialsLoaded,
    facialMaterials,
    isReady,
  ]);

  // 7. Materials Loading Completed. Set Ready to true.
  useEffect(() => {
    if (
      isModelLoaded &&
      isAnimationsLoaded &&
      isFacialMaterialsLoaded &&
      !isReady
    ) {
      console.log('Materials Loaded');
      props.setLoadProgress(100);
      props.setLoadProgressTotal(100);
      setIsReady(true);
      props.onLoad?.();
    }
  }, [isModelLoaded, isAnimationsLoaded, isFacialMaterialsLoaded, isReady]);

  // Change the body texture material.
  useEffect(() => {
    if (
      isReady &&
      props.bodyTexture != bodyTextureRef.current && //  != bodyTextureRef.current
      !bodyMaterialLoading
    ) {
      // console.log('Body Texture Change:', props.bodyTexture);
      bodyTextureRef.current = props.bodyTexture;
      handleOnChangeBodyTexture();
    }
  }, [props.bodyTexture, bodyMaterialLoading, isReady]);

  // Handles either loads a new texture or calls for the current texture to be set.
  const handleOnChangeBodyTexture = useCallback(() => {
    if (!isReady) return;
    console.log('handleOnChangeBodyTexture');
    if (!(props.bodyTexture in bodyMaterials)) {
      console.log('handleOnChangeBodyTexture material is not loaded');
      setBodyMaterialLoading(true);
      const loadedBodyMaterials = { ...bodyMaterials };
      loadedBodyMaterials[props.bodyTexture] = new BodyMaterialLoader(
        props.bodyTexture,
        MATERIAL_TYPES.BODY,
      );
      setBodyMaterials(loadedBodyMaterials);
      loadedBodyMaterials[props.bodyTexture]?.load(() =>
        setBodyMaterialLoading(false),
      );
    } else {
      console.log('handleOnChangeBodyTexture material is loaded');
      handleUpdateBodyTexture();
    }
  }, [props.bodyTexture, bodyMaterials, isReady]);

  // Handles when the loading of the new texture is completed.
  useEffect(() => {
    if (isReady && !bodyMaterialLoading && props.bodyTexture in bodyMaterials) {
      console.log('Body Texture Loaded');
      handleUpdateBodyTexture();
    }
  }, [bodyMaterials, bodyMaterialLoading, props.bodyTexture, isReady]);

  // Handles updating the body texture.
  const handleUpdateBodyTexture = useCallback(() => {
    if (!isReady) return;
    console.log('handleUpdateBodyTexture');
    (modelMeshes[MESH_TYPES.BODY_ARMS]?.material as MeshPhysicalMaterial).map =
      bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    (
      modelMeshes[MESH_TYPES.BODY_ARMS]?.material as MeshPhysicalMaterial
    ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    (modelMeshes[MESH_TYPES.BODY_HEAD]?.material as MeshPhysicalMaterial).map =
      bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    (
      modelMeshes[MESH_TYPES.BODY_HEAD]?.material as MeshPhysicalMaterial
    ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    (modelMeshes[MESH_TYPES.BODY_LEGS]?.material as MeshPhysicalMaterial).map =
      bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    (
      modelMeshes[MESH_TYPES.BODY_LEGS]?.material as MeshPhysicalMaterial
    ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    (modelMeshes[MESH_TYPES.BODY_TORSO]?.material as MeshPhysicalMaterial).map =
      bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    (
      modelMeshes[MESH_TYPES.BODY_TORSO]?.material as MeshPhysicalMaterial
    ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
  }, [props.bodyTexture, bodyMaterials, isReady, modelMeshes]);

  return (
    <>
      {isReady && (
        <Suspense fallback={null}>
          <primitive object={modelData.scene} />
          <Animator
            animationClips={animationClips}
            animationGestures={animationGestures}
            animationSequence={props.animationSequence}
            emotionEvent={props.emotionEvent}
            facialMaterials={facialMaterials}
            isReady={isReady}
            isModelLoaded={isModelLoaded}
            model={modelData.scene.children[0]}
            modelMeshes={modelMeshes}
            phonemes={props.phonemes}
            setIsPlaying={setIsPlaying}
          />
        </Suspense>
      )}
    </>
  );
}
