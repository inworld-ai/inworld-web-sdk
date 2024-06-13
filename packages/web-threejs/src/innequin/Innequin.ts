import { AdditionalPhonemeInfo, EmotionBehaviorCode } from '@inworld/web-core';
import {
  AnimationClip,
  Group,
  MeshPhysicalMaterial,
  Object3D,
  Object3DEventMap,
  SkinnedMesh,
} from 'three';
import { GLTF } from 'three-stdlib';

import { BatchFileLoader } from '../loaders/BatchFileLoader';
import { BodyMaterialLoader } from '../loaders/BodyMaterialLoader';
import { FacialMaterialLoader } from '../loaders/FacialMaterialLoader';
import { GLTFAnimationLoader } from '../loaders/GLTFAnimationLoader';
import { GLTFModelLoader } from '../loaders/GLTFModelLoader';
import { JSONFileLoader } from '../loaders/JSONFileLoader';
import {
  ANIMATION_TYPE,
  AnimationGesture,
  EMOTIONS_FACE,
  FACE_TEXTURE_TYPES,
  MATERIAL_TYPES,
  MESH_TYPE_ID,
  MESH_TYPES,
  SkinType,
} from '../types/types';
import { log } from '../utils/Log';
import { InnequinAnimator } from './animator/InnequinAnimator';
import {
  InnequinAnimationType,
  InnequinConfiguration,
} from './InnequinConfiguration';

export type InnequinProps = {
  baseURI: string;
  configURI: string;
  dracoURI: string;
  skinName?: string;
  onLoad: (config: InnequinConfiguration) => void;
  onProgress: Function;
};

// These variables are constants relating to the names within the 3D files
// They can change occasionally and eventually these names will be standarized or
// the names need to be externally passed in via the config variable.
export const BODY_MATERIAL_NAME_MALE = 'T_pose_model_Mannequin_body';
export const BODY_MATERIAL_NAME_FEMALE = 'T_pose_model_MannequinFemale_body';

export const MESH_IDS: MESH_TYPE_ID[] = [
  { meshName: 'faceLayer_brows_geo', meshType: MESH_TYPES.BROW },
  { meshName: 'faceLayer_eyes_geo', meshType: MESH_TYPES.EYE },
  { meshName: 'faceLayer_mouth_geo', meshType: MESH_TYPES.MOUTH },
  { meshName: 'faceLayer_nose_geo', meshType: MESH_TYPES.NOSE },
  { meshName: 'Mannequin_Arms', meshType: MESH_TYPES.BODY_ARMS },
  { meshName: 'Mannequin_Body', meshType: MESH_TYPES.BODY_TORSO },
  { meshName: 'Mannequin_Head', meshType: MESH_TYPES.BODY_HEAD },
  { meshName: 'Mannequin_Legs', meshType: MESH_TYPES.BODY_LEGS },
];

export class Innequin {
  animator: InnequinAnimator | null;
  animationClips: { [key: string]: AnimationClip };
  animationGestures: AnimationGesture[];
  animationLoaders: { [key: string]: GLTFAnimationLoader };
  baseURI: string;
  bodySkins: { [key: string]: BodyMaterialLoader };
  bodySkinName: string;
  config: InnequinConfiguration | null;
  configFile: JSONFileLoader;
  configURI: string;
  dracoURI: string;
  facialMaterialLoaders: { [key: string]: FacialMaterialLoader };
  onLoad: (config: InnequinConfiguration) => void;
  onProgress: Function;
  modelFile: GLTFModelLoader | null;
  modelMaterials: { [key: string]: MeshPhysicalMaterial };
  modelMeshes: { [key: string]: SkinnedMesh };
  bodySkinNameInit: string;
  isSkinLoading: boolean;

  constructor(props: InnequinProps) {
    this.baseURI = props.baseURI;
    this.configURI = props.configURI;
    this.dracoURI = props.dracoURI;
    this.onLoad = props.onLoad;
    this.onProgress = props.onProgress;
    this.animationClips = {};
    this.animationGestures = [];
    this.modelMaterials = {};
    this.modelMeshes = {};
    this.animationLoaders = {};
    this.bodySkins = {};
    this.facialMaterialLoaders = {};
    if (props.skinName) {
      this.bodySkinNameInit = props.skinName;
    }
    this.isSkinLoading = false;

    this.onLoadAnimations = this.onLoadAnimations.bind(this);
    this.onLoadComplete = this.onLoadComplete.bind(this);
    this.onLoadConfig = this.onLoadConfig.bind(this);
    this.onLoadModel = this.onLoadModel.bind(this);
    this.onLoadProgress = this.onLoadProgress.bind(this);
    this.onLoadSkin = this.onLoadSkin.bind(this);
    this.onLoadVismeMaterials = this.onLoadVismeMaterials.bind(this);

    this.init();
  }

  init() {
    log('Innequin - Loading Character');
    this.loadConfig();
  }

  getGLTF(): GLTF {
    if (this.modelFile && this.modelFile.getGLTF()) {
      return this.modelFile.getGLTF();
    }
  }

  getModel(): Object3D<Object3DEventMap> {
    return this.getScene().getObjectByName('Armature');
  }

  getScene(): Group<Object3DEventMap> {
    return this.getGLTF().scene;
  }

  hasGender(material: MeshPhysicalMaterial) {
    return [BODY_MATERIAL_NAME_MALE, BODY_MATERIAL_NAME_FEMALE].includes(
      material.name,
    );
  }

  loadAnimations() {
    log('Innequin - Loading Animations');
    for (const animationName in this.config.innequin.animations) {
      const animation: InnequinAnimationType =
        this.config.innequin.animations[animationName];
      const fileURI: string =
        this.baseURI +
        this.config.innequin.baseURIs.MODELS_ANIMATIONS_EMOTIONS +
        animation.file;
      this.animationLoaders[animationName] = new GLTFAnimationLoader({
        name: animationName,
        fileURI: fileURI,
      });
    }
    const batchLoader = new BatchFileLoader({
      fileLoaders: this.animationLoaders,
      callback: this.onLoadAnimations,
      startProgress: 33,
      endProgress: 66,
      updateProgress: this.onLoadProgress,
    });
    batchLoader;
  }

  // Loads the config.json file with the animations, assets and skins character data as well as the global paths to asset files.
  loadConfig() {
    log('Innequin - Loading Config');
    this.configFile = new JSONFileLoader({ fileURI: this.configURI });
    this.configFile.load(this.onLoadConfig);
  }

  loadModel() {
    log('Innequin - Loading Model');
    const fileURI: string =
      this.baseURI +
      this.config.innequin.baseURIs.MODELS_BODY +
      this.config.innequin.defaults.MODEL;
    this.modelFile = new GLTFModelLoader({
      path: fileURI,
      dracoPath: this.dracoURI,
    });
    this.modelFile.load(this.onLoadModel);
  }

  loadVismeMaterials() {
    Object.values(EMOTIONS_FACE).forEach((valueEmotionType) => {
      Object.values(FACE_TEXTURE_TYPES).forEach((valueFaceType) => {
        this.facialMaterialLoaders[
          valueEmotionType.toLowerCase() +
            '_' +
            valueFaceType +
            '_' +
            (valueFaceType !== FACE_TEXTURE_TYPES.VISEMES
              ? MATERIAL_TYPES.FEATURE
              : MATERIAL_TYPES.VISEME)
        ] = new FacialMaterialLoader({
          emotionType: valueEmotionType,
          faceType: valueFaceType,
          materialType:
            valueFaceType !== FACE_TEXTURE_TYPES.VISEMES
              ? MATERIAL_TYPES.FEATURE
              : MATERIAL_TYPES.VISEME,
          baseURI:
            this.baseURI +
            this.config.innequin.baseURIs.TEXTURES_FACIAL_EMOTIONS +
            this.config.innequin.defaults.GENDER +
            '/',
        });
      });
    });
    const batchLoader = new BatchFileLoader({
      fileLoaders: this.facialMaterialLoaders,
      callback: this.onLoadVismeMaterials,
      startProgress: 66,
      endProgress: 100,
      updateProgress: this.onLoadProgress,
    });
    batchLoader;
  }

  playAnimation(animation: string) {
    if (this.animationClips[animation]) {
      this.animator.playAnimation(animation);
    } else {
      throw new Error(
        'ERROR Innequin playAnimation. Animation not found: ' + animation,
      );
    }
  }

  setEmotion(event: EmotionBehaviorCode) {
    if (this.animator) {
      this.animator.setEmotion(event);
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (this.animator) {
      this.animator.setPhonemes(phonemes);
    }
  }

  setSkin(skinName: string) {
    if (this.bodySkinName !== skinName && !this.isSkinLoading) {
      log('Innequin - Changing skin to:', skinName);
      this.bodySkinName = skinName;
      if (!this.bodySkins[this.bodySkinName]) {
        log('-----> Skin not loaded. Loading...');
        this.isSkinLoading = true;
        const skin: SkinType = this.config.innequin.skins[skinName];
        if (!skin) {
          throw new Error(
            `BodyMaterialLoader Error: Skin name ${skinName} not found in Skins data.`,
          );
        }
        this.bodySkins[skinName] = new BodyMaterialLoader({
          skinName: skinName,
          skin: skin,
          materialType: MATERIAL_TYPES.BODY,
          baseURI: this.baseURI + this.config.innequin.baseURIs.TEXTURES_BODY,
        });
        this.bodySkins[this.bodySkinName]?.load(() => this.onLoadSkin());
      } else {
        log('-----> Skin alreaded loaded.');
        this.updateBodySkin();
      }
    }
  }

  updateBodySkin() {
    const bodyMatIDs: MESH_TYPES[] = [
      MESH_TYPES.BODY_ARMS,
      MESH_TYPES.BODY_HEAD,
      MESH_TYPES.BODY_LEGS,
      MESH_TYPES.BODY_TORSO,
    ];

    for (let i = 0; i < bodyMatIDs.length; i++) {
      this.modelMaterials[bodyMatIDs[i]].map =
        this.bodySkins[this.bodySkinName]!.getTextureColor()!.clone();
      this.modelMaterials[bodyMatIDs[i]].normalMap =
        this.bodySkins[this.bodySkinName]!.getTextureNormal()!.clone();
    }
  }

  updateFrame(delta: number) {
    if (this.animator) {
      this.animator.updateFrame(delta);
    }
  }

  // Helper Function
  addMesh(mesh: SkinnedMesh, type: MESH_TYPES) {
    if (mesh.material && this.hasGender(mesh.material as MeshPhysicalMaterial))
      this.modelMaterials[type] = mesh.material as MeshPhysicalMaterial;
    else {
      mesh.traverse((subMesh) => {
        if (
          (subMesh as SkinnedMesh).material &&
          this.hasGender(
            (subMesh as SkinnedMesh).material as MeshPhysicalMaterial,
          )
        ) {
          this.modelMaterials[type] = (subMesh as SkinnedMesh)
            .material as MeshPhysicalMaterial;
        }
      });
    }
    this.modelMeshes[type] = mesh;
  }

  onLoadAnimations() {
    for (const animationName in this.animationLoaders) {
      const animation: InnequinAnimationType =
        this.config.innequin.animations[animationName];
      this.animationClips[this.animationLoaders[animationName]!.name] =
        this.animationLoaders[animationName]!.animationClip!;
      if (animation.type === ANIMATION_TYPE.GESTURE) {
        const animationGesture: AnimationGesture = {
          name: this.animationLoaders[animationName]!.name,
          duration:
            this.animationLoaders[animationName]!.animationClip!.duration,
          emotion: animation.emotion,
        };
        this.animationGestures.push(animationGesture);
      }
    }
    log('Innequin - Animations Loaded.');
    this.loadVismeMaterials();
  }

  onLoadComplete() {
    this.onLoad(this.config);
    log('Innequin - Character Loaded.');
    this.animator.onReady();
  }

  onLoadConfig(config: InnequinConfiguration) {
    log('Innequin - Config Loaded.');
    this.config = config;
    this.configFile = null;
    this.bodySkinName = this.config.innequin.defaults.SKIN;
    this.loadModel();
  }

  onLoadModel() {
    // This next block parses the model and locates the detected
    // meshes needed to run Innequin
    let skeleton: SkinnedMesh | undefined;
    this.getModel().traverse((child) => {
      if (child.name === 'Armature') {
        skeleton = child as SkinnedMesh;
      }
    });

    if (!skeleton) throw new Error('Innequin - Error skeleton not found');

    skeleton.traverse((child) => {
      for (let i = 0; i < MESH_IDS.length; i++) {
        if (child.name === MESH_IDS[i].meshName) {
          this.addMesh(child as SkinnedMesh, MESH_IDS[i].meshType);
          break;
        }
      }
    });

    // Hides all the accessories on the model.
    // Currently this is commented out awaiting future architecture
    // InnequinAssetController.updateDisplayList(
    //   this.getModel() as SkinnedMesh,
    //   this.config.innequin.assets,
    // );

    log('Innequin - Model Loaded');
    this.loadAnimations();
  }

  onLoadProgress(progress: number) {
    log('-----> Loading Progress:', progress);
    this.onProgress(progress);
  }

  onLoadSkin() {
    log('-----> Loading Complete.');
    this.isSkinLoading = false;
    this.updateBodySkin();
    // If this is the pre-load skin change then load complete after.
    if (!this.animator.isReady) {
      this.onLoadComplete();
    }
  }

  onLoadVismeMaterials() {
    log('Innequin - Visemes Textures Loaded.');
    this.animator = new InnequinAnimator({
      animations: this.config.innequin.animations,
      animationClips: this.animationClips,
      animationGestures: this.animationGestures,
      facialMaterials: this.facialMaterialLoaders,
      defaultAnimation: this.config.innequin.defaults.INTRO_ANIMATION,
      defaultEmotion: this.config.innequin.defaults.EMOTION,
      model: this.getModel(),
      modelMeshes: this.modelMeshes,
    });
    if (
      this.bodySkinNameInit &&
      this.bodySkinNameInit !== this.config.innequin.defaults.SKIN
    ) {
      this.setSkin(this.bodySkinNameInit);
    } else {
      this.onLoadComplete();
    }
  }
}
