import { AdditionalPhonemeInfo, EmotionEvent } from '@inworld/web-sdk';
import { useLoader } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimationClip, MeshPhysicalMaterial, SkinnedMesh } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { Config } from './../../../config';
import { Animator } from './animator/Animator';
import { MESH_IDS } from './data/ids';
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
import { AssetManager } from './managers/AssetManager';

interface ModelProps {
  modelURI: string;
  bodyTexture: string;
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

  const [modelMaterials, setModelMaterials] = useState<{
    [key: string]: MeshPhysicalMaterial;
  }>({});

  const [modelMeshes, setModelMeshes] = useState<{
    [key: string]: SkinnedMesh | null;
  }>({});

  // 1. Model Loading Completed
  useEffect(() => {
    if (!isModelLoaded && modelData) {
      console.log('Model Loaded');
      modelRef.current = modelData;
      const loadingModelMaterials = { ...modelMaterials };
      const loadingModelMeshes = { ...modelMeshes };
      let skeleton: SkinnedMesh | undefined;
      modelData.scene.traverse((child) => {
        if (child.name === 'skeleton') {
          skeleton = child as SkinnedMesh;
        }
      });

      if (!skeleton)
        throw new Error('Error base skeleton mesh not found in model');

      skeleton?.traverse((child) => {
        function addChild(mesh: SkinnedMesh, type: MESH_TYPES) {
          if (
            mesh.material &&
            (mesh.material as MeshPhysicalMaterial).name ===
              'T_pose_model_Mannequin_body'
          )
            loadingModelMaterials[type] = mesh.material as MeshPhysicalMaterial;
          else {
            mesh.traverse((subMesh) => {
              if (
                (subMesh as SkinnedMesh).material &&
                ((subMesh as SkinnedMesh).material as MeshPhysicalMaterial)
                  .name === 'T_pose_model_Mannequin_body'
              ) {
                loadingModelMaterials[type] = (subMesh as SkinnedMesh)
                  .material as MeshPhysicalMaterial;
              }
            });
          }
          loadingModelMeshes[type] = mesh;
        }

        for (let i = 0; i < MESH_IDS.length; i++) {
          if (child.name == MESH_IDS[i].meshName) {
            addChild(child as SkinnedMesh, MESH_IDS[i].meshType);
          }
        }

        // if (child.name == 'faceLayer_brows_geo') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.BROW);
        // }
        // if (child.name == 'faceLayer_eyes_geo') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.EYE);
        // }
        // if (child.name == 'faceLayer_mouth_geo') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.MOUTH);
        // }
        // if (child.name == 'faceLayer_nose_geo') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.NOSE);
        // }
        // if (child.name == 'Mannequin_Arms') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.BODY_ARMS);
        // }
        // if (child.name == 'Mannequin_Head_04') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.BODY_HEAD);
        // }
        // if (child.name == 'Mannequin_Legs') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.BODY_LEGS);
        // }
        // if (child.name == 'Mannequin_Body') {
        //   addChildren(child as SkinnedMesh, MESH_TYPES.BODY_TORSO);
        // }
        // if (child.name == 'faceLayer_eyes_geo') {
        //   loadingModelMaterials[MESH_TYPES.EYE] = (child as SkinnedMesh)
        //     .material as MeshPhysicalMaterial;
        //   loadingModelMeshes[MESH_TYPES.EYE] = child as SkinnedMesh;
        // }
        // if (child.name == 'faceLayer_mouth_geo') {
        //   loadingModelMaterials[MESH_TYPES.MOUTH] = (child as SkinnedMesh)
        //     .material as MeshPhysicalMaterial;
        //   loadingModelMeshes[MESH_TYPES.MOUTH] = child as SkinnedMesh;
        // }
        // if (child.name == 'faceLayer_nose_geo') {
        //   loadingModelMaterials[MESH_TYPES.NOSE] = (child as SkinnedMesh)
        //     .material as MeshPhysicalMaterial;
        //   loadingModelMeshes[MESH_TYPES.NOSE] = child as SkinnedMesh;
        // }
        // if (child.name == 'Mannequin_Arms') {
        //   (child as SkinnedMesh).traverse((subMesh) => {
        //     if (
        //       (subMesh as SkinnedMesh).material &&
        //       ((subMesh as SkinnedMesh).material as MeshPhysicalMaterial)
        //         .name === 'T_pose_model_Mannequin_body'
        //     ) {
        //       loadingModelMaterials[MESH_TYPES.BODY_ARMS] = (
        //         subMesh as SkinnedMesh
        //       ).material as MeshPhysicalMaterial;
        //     }
        //   });
        //   loadingModelMeshes[MESH_TYPES.BODY_ARMS] = child as SkinnedMesh;
        // }

        // if (child.name == 'Mannequin_Head_04') {
        //   loadingModelMaterials[MESH_TYPES.BODY_HEAD] = (child as SkinnedMesh)
        //     .material as MeshPhysicalMaterial;
        //   loadingModelMeshes[MESH_TYPES.BODY_HEAD] = child as SkinnedMesh;
        // }
        // if (child.name == 'Mannequin_Legs') {
        //   (child as SkinnedMesh).traverse((subMesh) => {
        //     if (
        //       (subMesh as SkinnedMesh).material &&
        //       ((subMesh as SkinnedMesh).material as MeshPhysicalMaterial)
        //         .name === 'T_pose_model_Mannequin_body'
        //     ) {
        //       loadingModelMaterials[MESH_TYPES.BODY_LEGS] = (
        //         subMesh as SkinnedMesh
        //       ).material as MeshPhysicalMaterial;
        //     }
        //   });
        //   loadingModelMeshes[MESH_TYPES.BODY_LEGS] = child as SkinnedMesh;
        // }
        // if (child.name == 'Mannequin_Body') {
        //   loadingModelMaterials[MESH_TYPES.BODY_TORSO] = (child as SkinnedMesh)
        //     .material as MeshPhysicalMaterial;
        //   loadingModelMeshes[MESH_TYPES.BODY_TORSO] = child as SkinnedMesh;
        // }
      });

      // // Brow
      // loadingModelMaterials[MESH_TYPES.BROW] = (
      //   skeleton?.children.find(
      //     (item) => item.name === 'faceLayer_brows_geo',
      //   ) as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.BROW] = skeleton?.children.find(
      //   (item) => item.name === 'faceLayer_brows_geo',
      // ) as SkinnedMesh;
      // // Eye
      // loadingModelMaterials[MESH_TYPES.EYE] = (
      //   skeleton?.children.find(
      //     (item) => item.name === 'faceLayer_eyes_geo',
      //   ) as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.EYE] = skeleton?.children.find(
      //   (item) => item.name === 'faceLayer_eyes_geo',
      // ) as SkinnedMesh;
      // // Mouth
      // loadingModelMaterials[MESH_TYPES.MOUTH] = (
      //   skeleton?.children.find(
      //     (item) => item.name === 'faceLayer_mouth_geo',
      //   ) as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.MOUTH] = skeleton?.children.find(
      //   (item) => item.name === 'faceLayer_mouth_geo',
      // ) as SkinnedMesh;
      // // Nose
      // loadingModelMaterials[MESH_TYPES.NOSE] = (
      //   skeleton?.children.find(
      //     (item) => item.name === 'faceLayer_nose_geo',
      //   ) as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.NOSE] = skeleton?.children.find(
      //   (item) => item.name === 'faceLayer_nose_geo',
      // ) as SkinnedMesh;

      // Arms

      // console.log(
      //   'Arms',
      //   skeleton?.children.find(
      //     (item) => item.name === 'Mannequin_Arms',
      //   ) as SkinnedMesh,
      // );
      // loadingModelMaterials[MESH_TYPES.BODY_ARMS] = (
      //   (
      //     skeleton?.children.find(
      //       (item) => item.name === 'Mannequin_Arms',
      //     ) as SkinnedMesh
      //   ).getObjectByName('T_pose_model_Mannequin_body') as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.BODY_ARMS] = skeleton?.children.find(
      //   (item) => item.name === 'Mannequin_Arms',
      // ) as SkinnedMesh;
      // // Head
      // loadingModelMaterials[MESH_TYPES.BODY_HEAD] = (
      //   skeleton?.children.find(
      //     (item) => item.name === 'Mannequin_Head_04',
      //   ) as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.BODY_HEAD] = skeleton?.children.find(
      //   (item) => item.name === 'Mannequin_Head_04',
      // ) as SkinnedMesh;
      // Legs
      // loadingModelMaterials[MESH_TYPES.BODY_LEGS] = (
      //   (
      //     skeleton?.children.find(
      //       (item) => item.name === 'Mannequin_Legs',
      //     ) as SkinnedMesh
      //   ).getObjectByName('T_pose_model_Mannequin_body') as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.BODY_LEGS] = skeleton?.children.find(
      //   (item) => item.name === 'Mannequin_Legs',
      // ) as SkinnedMesh;
      // // Body
      // loadingModelMaterials[MESH_TYPES.BODY_TORSO] = (
      //   skeleton?.children.find(
      //     (item) => item.name === 'Mannequin_Body',
      //   ) as SkinnedMesh
      // ).material as MeshPhysicalMaterial;
      // loadingModelMeshes[MESH_TYPES.BODY_TORSO] = skeleton?.children.find(
      //   (item) => item.name === 'Mannequin_Body',
      // ) as SkinnedMesh;

      AssetManager.updateDisplayList(modelData);
      props.setLoadProgress(33);
      props.setLoadProgressTotal(66);
      setModelMaterials(loadingModelMaterials);
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
              (valueFaceType !== FACE_TEXTURE_TYPES.VISEMES
                ? MATERIAL_TYPES.FEATURE
                : MATERIAL_TYPES.VISEME)
          ] = new FaceMaterialLoader(
            valueEmotionType,
            valueFaceType,
            valueFaceType !== FACE_TEXTURE_TYPES.VISEMES
              ? MATERIAL_TYPES.FEATURE
              : MATERIAL_TYPES.VISEME,
          );
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
      console.log('Body Texture Change:', props.bodyTexture);
      // props.setIsSpinner(true);
      bodyTextureRef.current = props.bodyTexture;
      handleOnChangeBodyTexture();
    }
  }, [props.bodyTexture, bodyMaterialLoading, isReady]);

  // Handles either loads a new texture or calls for the current texture to be set.
  const handleOnChangeBodyTexture = useCallback(() => {
    if (!isReady) return;
    console.log('handleOnChangeBodyTexture');
    if (!(props.bodyTexture in bodyMaterials)) {
      console.log(
        `handleOnChangeBodyTexture material ${props.bodyTexture} is not loaded`,
      );
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
      console.log(
        `handleOnChangeBodyTexture material ${props.bodyTexture} is loaded`,
      );
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

    const bodyMatIDs: MESH_TYPES[] = [
      MESH_TYPES.BODY_ARMS,
      MESH_TYPES.BODY_HEAD,
      MESH_TYPES.BODY_LEGS,
      MESH_TYPES.BODY_TORSO,
    ];

    for (let i = 0; i < bodyMatIDs.length; i++) {
      modelMaterials[bodyMatIDs[i]].map =
        bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
      modelMaterials[bodyMatIDs[i]].normalMap =
        bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    }

    // modelMaterials[MESH_TYPES.BODY_ARMS].map =
    //   bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // modelMaterials[MESH_TYPES.BODY_ARMS].normalMap =
    //   bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();

    // modelMaterials[MESH_TYPES.BODY_HEAD].map =
    //   bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // modelMaterials[MESH_TYPES.BODY_HEAD].normalMap =
    //   bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();

    // modelMaterials[MESH_TYPES.BODY_LEGS].map =
    //   bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // modelMaterials[MESH_TYPES.BODY_LEGS].normalMap =
    //   bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();

    // modelMaterials[MESH_TYPES.BODY_TORSO].map =
    //   bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // modelMaterials[MESH_TYPES.BODY_TORSO].normalMap =
    //   bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();

    // modelSkeleton?.traverse((child) => {
    //   if (
    //     (child as SkinnedMesh).material &&
    //     ((child as SkinnedMesh).material as MeshPhysicalMaterial).name ==
    //       'T_pose_model_Mannequin_body'
    //   ) {
    //     ((child as SkinnedMesh).material as MeshPhysicalMaterial).map =
    //       bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();

    //     ((child as SkinnedMesh).material as MeshPhysicalMaterial).normalMap =
    //       bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    //   }
    // });

    // const skeleton = modelData.scene.children[0].children.find(
    //   (item) => item.name === 'skeleton',
    // );

    // const material_body = modelData.scene.children[0].getObjectByName(
    //   'T_pose_model_Mannequin_body',
    // );

    // console.log('material_body', material_body);

    // const material_joints = modelData.scene.children[0].getObjectByName(
    //   'T_pose_model_Mannequin_joints',
    // );

    // if (!material_body) throw new Error('Material Body is not found');

    // modelMeshes[MESH_TYPES.BODY_ARMS]?.traverse((child) => {
    //   if ((child as THREE.Mesh).isMesh) {
    //     console.log('Mesh Iteration:', child.name);
    //   }
    // });

    // (
    //   (
    //     modelMeshes[MESH_TYPES.BODY_ARMS]?.children.find(
    //       (child) => child.material.name === 'T_pose_model_Mannequin_body',
    //     ) as SkinnedMesh
    //   ).material as MeshPhysicalMaterial
    // ).map = bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();

    // (
    //   (
    //     modelMeshes[MESH_TYPES.BODY_ARMS]?.children.find(
    //       (child) => child.material.name === 'T_pose_model_Mannequin_body',
    //     ) as SkinnedMesh
    //   ).material as MeshPhysicalMaterial
    // ).map = bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // (
    //   (modelMeshes[MESH_TYPES.BODY_ARMS]?.children[0] as SkinnedMesh)
    //     .material as MeshPhysicalMaterial
    // ).map = bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // (
    //   (modelMeshes[MESH_TYPES.BODY_ARMS]?.children[0] as SkinnedMesh)
    //     .material as MeshPhysicalMaterial
    // ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    // (modelMeshes[MESH_TYPES.BODY_HEAD]?.material as MeshPhysicalMaterial).map =
    //   bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // (
    //   modelMeshes[MESH_TYPES.BODY_HEAD]?.material as MeshPhysicalMaterial
    // ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    // (
    //   (modelMeshes[MESH_TYPES.BODY_LEGS]?.children[0] as SkinnedMesh)
    //     ?.material as MeshPhysicalMaterial
    // ).map = bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // (
    //   (modelMeshes[MESH_TYPES.BODY_LEGS]?.children[0] as SkinnedMesh)
    //     ?.material as MeshPhysicalMaterial
    // ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
    // (modelMeshes[MESH_TYPES.BODY_TORSO]?.material as MeshPhysicalMaterial).map =
    //   bodyMaterials[props.bodyTexture]!.getTextureColor()!.clone();
    // (
    //   modelMeshes[MESH_TYPES.BODY_TORSO]?.material as MeshPhysicalMaterial
    // ).normalMap = bodyMaterials[props.bodyTexture]!.getTextureNormal()!.clone();
  }, [props.bodyTexture, bodyMaterials, isReady, modelMaterials, modelMeshes]);

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
