/* eslint-disable */
import { Texture } from 'three';

import { Config } from '../../../../config';
import { TextureFileLoader } from './TextureFileLoader';

import {
  EMOTIONS_FACE,
  FACE_TEXTURE_TYPES,
  MATERIAL_TYPES,
  TEXTURE_TYPES,
} from '../data/types';

// This file manages the loading of the facial materials for emotion and speaking animations.
// There is an unused property called Alpha within this class that was apart of the original animation

// File constants
const EXT: string = '.png';

export class FaceMaterialLoader {
  callback?: Function;
  isLoaded: Boolean = false;
  emotionType: EMOTIONS_FACE;
  faceType: FACE_TEXTURE_TYPES;
  materialType: MATERIAL_TYPES;
  textureFileLoaderColor: TextureFileLoader;

  constructor(
    emotionType: EMOTIONS_FACE,
    faceType: FACE_TEXTURE_TYPES,
    materialType: MATERIAL_TYPES,
  ) {
    this.emotionType = emotionType;
    this.faceType = faceType;
    this.materialType = materialType;
    this.textureFileLoaderColor = new TextureFileLoader(
      this._generateFileURI(TEXTURE_TYPES.COLOR),
    );
    this.onLoad = this.onLoad.bind(this);
  }

  private _generateFileURI(textureType: TEXTURE_TYPES): string {
    let fileURI = Config.IMAGES_FACIAL_URI;

    if (
      this.materialType === MATERIAL_TYPES.FEATURE ||
      this.materialType === MATERIAL_TYPES.VISEME
    ) {
      fileURI += this.emotionType + '/';
      fileURI += this.faceType + '_' + this.emotionType;
    }

    if (this.materialType === MATERIAL_TYPES.EMOTE) {
      // TODO
    }

    if (textureType === TEXTURE_TYPES.COLOR) {
      fileURI += EXT;
    }
    return fileURI;
  }

  public getTextureColor(): Texture | undefined {
    return this.textureFileLoaderColor.texture;
  }

  public load(callback: Function) {
    this.callback = callback;
    this.textureFileLoaderColor.load(this.onLoad);
  }

  private onLoad() {
    if (this.textureFileLoaderColor.isLoaded) {
      if (this.materialType === MATERIAL_TYPES.VISEME) {
        this.textureFileLoaderColor.texture?.repeat.set(0.25, 0.25);
      }
      this.isLoaded = true;
      this.callback!();
    }
  }
}
