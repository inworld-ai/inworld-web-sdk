/* eslint-disable */
import { SRGBColorSpace, Texture } from 'three';

import { MATERIAL_TYPES, SkinType, TEXTURE_TYPES } from '../types/types';
import { TextureFileLoader } from './TextureFileLoader';

export interface BodyMaterialLoaderProps {
  skinName: string;
  skin: SkinType;
  materialType: MATERIAL_TYPES;
  baseURI: string;
}

export class BodyMaterialLoader {
  baseURI: string;
  callback?: Function;
  isLoaded: Boolean = false;
  skinName: string;
  materialType: MATERIAL_TYPES;
  skin: SkinType;
  textureFileLoaderColor: TextureFileLoader;
  textureFileLoaderNormal: TextureFileLoader;

  constructor(props: BodyMaterialLoaderProps) {
    this.baseURI = props.baseURI;
    this.skinName = props.skinName;
    this.skin = props.skin;
    this.materialType = props.materialType;
    this.textureFileLoaderColor = new TextureFileLoader({
      fileURI: this._generateFileURI(TEXTURE_TYPES.COLOR),
    });
    this.textureFileLoaderNormal = new TextureFileLoader({
      fileURI: this._generateFileURI(TEXTURE_TYPES.NORMAL),
    });
    this.onLoad = this.onLoad.bind(this);
  }

  private _generateFileURI(textureType: TEXTURE_TYPES): string {
    let fileURI = this.baseURI;

    if (textureType === TEXTURE_TYPES.COLOR) {
      fileURI += this.skin?.color;
    }

    if (textureType === TEXTURE_TYPES.NORMAL) {
      fileURI += this.skin?.normals;
    }
    return fileURI;
  }

  public getTextureColor(): Texture | undefined {
    return this.textureFileLoaderColor.texture;
  }

  public getTextureNormal(): Texture | undefined {
    return this.textureFileLoaderNormal.texture;
  }

  public load(callback: Function) {
    this.callback = callback;
    this.textureFileLoaderColor.load(this.onLoad);
    this.textureFileLoaderNormal.load(this.onLoad);
  }

  private onLoad() {
    if (
      this.textureFileLoaderNormal.isLoaded &&
      this.textureFileLoaderColor.isLoaded
    ) {
      this.getTextureColor()!.colorSpace = SRGBColorSpace;
      this.isLoaded = true;
      this.callback!();
    }
  }
}
