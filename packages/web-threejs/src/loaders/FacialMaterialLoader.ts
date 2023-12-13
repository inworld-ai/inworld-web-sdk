/* eslint-disable */
import { Texture } from 'three';

import {
  EMOTIONS_FACE,
  FACE_TEXTURE_TYPES,
  MATERIAL_TYPES,
  TEXTURE_TYPES,
} from '../types/types';
import { IFileLoader } from './IFileLoader';
import { TextureFileLoader } from './TextureFileLoader';

// This file manages the loading of the facial materials for emotion and speaking animations.
// It designed to work with a spritesheet at known dimensions.
// There is an unused property called Alpha within this class that was apart of the original animation

// File constants
const EXT: string = '.png';

export interface FacialMaterialLoaderProps {
  emotionType: EMOTIONS_FACE;
  faceType: FACE_TEXTURE_TYPES;
  materialType: MATERIAL_TYPES;
  baseURI: string;
}

export class FacialMaterialLoader implements IFileLoader {
  baseURI: string;
  callback?: Function;
  isLoaded: Boolean = false;
  emotionType: EMOTIONS_FACE;
  faceType: FACE_TEXTURE_TYPES;
  materialType: MATERIAL_TYPES;
  textureFileLoaderColor: TextureFileLoader;

  constructor(props: FacialMaterialLoaderProps) {
    this.baseURI = props.baseURI;
    this.emotionType = props.emotionType;
    this.faceType = props.faceType;
    this.materialType = props.materialType;
    this.textureFileLoaderColor = new TextureFileLoader({
      fileURI: this._generateFileURI(TEXTURE_TYPES.COLOR),
    });
    this.onLoad = this.onLoad.bind(this);
  }

  private _generateFileURI(textureType: TEXTURE_TYPES): string {
    let fileURI = this.baseURI;

    if (
      this.materialType === MATERIAL_TYPES.FEATURE ||
      this.materialType === MATERIAL_TYPES.VISEME
    ) {
      fileURI += this.emotionType.toLowerCase() + '/';
      fileURI += this.faceType + '_' + this.emotionType.toLowerCase();
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
