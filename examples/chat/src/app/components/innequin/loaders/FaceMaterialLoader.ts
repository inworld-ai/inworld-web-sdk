/* eslint-disable */
import { Texture } from 'three';

import { Config } from '../../../../config';
import { TextureFileLoader } from './TextureFileLoader';
import { VISEME_TYPES } from '../../../types';

import {
  EMOTIONS_FACE,
  FACE_TEXTURE_TYPES,
  MATERIAL_TYPES,
  TEXTURE_TYPES,
} from '../data/types';

// File constants
const ALPHA: string = '_opacity';
const EXT: string = '.png';
const VISEMES: string = 'visemes';

export class FaceMaterialLoader {
  callback?: Function;
  isLoaded: Boolean = false;
  emotionType: EMOTIONS_FACE;
  faceType: FACE_TEXTURE_TYPES;
  materialType: MATERIAL_TYPES;
  visemeType?: VISEME_TYPES | undefined;
  textureFileLoaderAlpha: TextureFileLoader;
  textureFileLoaderColor: TextureFileLoader;

  constructor(
    emotionType: EMOTIONS_FACE,
    faceType: FACE_TEXTURE_TYPES,
    materialType: MATERIAL_TYPES,
    visemeType?: VISEME_TYPES,
  ) {
    this.emotionType = emotionType;
    this.faceType = faceType;
    this.materialType = materialType;
    this.visemeType = visemeType;
    this.textureFileLoaderAlpha = new TextureFileLoader(
      this._generateFileURI(TEXTURE_TYPES.ALPHA),
    );
    this.textureFileLoaderColor = new TextureFileLoader(
      this._generateFileURI(TEXTURE_TYPES.COLOR),
    );
    this.onLoad = this.onLoad.bind(this);
  }

  private _generateFileURI(
    textureType: TEXTURE_TYPES,
    visemeType?: VISEME_TYPES,
  ): string {
    let fileURI = Config.IMAGES_FACIAL_URI;

    if (
      this.materialType === MATERIAL_TYPES.FEATURE ||
      this.materialType === MATERIAL_TYPES.VISEME
    ) {
      fileURI += this.emotionType + '/';
    }

    if (this.materialType === MATERIAL_TYPES.FEATURE) {
      fileURI += this.faceType + '_' + this.emotionType;
    }

    if (this.materialType === MATERIAL_TYPES.VISEME) {
      fileURI += VISEMES + '/' + this.visemeType + '_' + this.emotionType;
    }

    if (this.materialType === MATERIAL_TYPES.EMOTE) {
      // TODO
    }

    if (textureType === TEXTURE_TYPES.ALPHA) {
      fileURI += ALPHA + EXT;
    }
    if (textureType === TEXTURE_TYPES.COLOR) {
      fileURI += EXT;
    }
    return fileURI;
  }

  public getTextureAlpha(): Texture | undefined {
    return this.textureFileLoaderAlpha.texture;
  }

  public getTextureColor(): Texture | undefined {
    return this.textureFileLoaderColor.texture;
  }

  public load(callback: Function) {
    this.callback = callback;
    this.textureFileLoaderAlpha.load(this.onLoad);
    this.textureFileLoaderColor.load(this.onLoad);
  }

  private onLoad() {
    if (
      this.textureFileLoaderAlpha.isLoaded &&
      this.textureFileLoaderColor.isLoaded
    ) {
      this.isLoaded = true;
      this.callback!();
    }
  }
}
