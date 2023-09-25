/* eslint-disable */
import { Texture } from 'three';
import { SRGBColorSpace } from 'three';

import { Config } from '../../../../config';
import { TextureFileLoader } from './TextureFileLoader';
import { MATERIAL_TYPES, TEXTURE_TYPES } from '../data/types';

import { Skins } from '../data/skins';
import { Skin } from '../data/types';

export class BodyMaterialLoader {
  callback?: Function;
  isLoaded: Boolean = false;
  bodyTextureName: string;
  materialType: MATERIAL_TYPES;
  skin: Skin | undefined;
  textureFileLoaderColor: TextureFileLoader;
  textureFileLoaderNormal: TextureFileLoader;

  constructor(
    bodyTextureName: string,
    materialType: MATERIAL_TYPES,
  ) {
    this.bodyTextureName = bodyTextureName;
    this.skin = Skins.find((skin) => skin.name == this.bodyTextureName);
    if (!this.skin) {
      throw new Error(`BodyMaterialLoader Error: Skin name ${this.bodyTextureName} not found in Skins data.`);
    }
    this.materialType = materialType;
    this.textureFileLoaderColor = new TextureFileLoader(
      this._generateFileURI(TEXTURE_TYPES.COLOR),
    );
    this.textureFileLoaderNormal = new TextureFileLoader(
      this._generateFileURI(TEXTURE_TYPES.NORMAL),
    );
    this.onLoad = this.onLoad.bind(this);
  }

  private _generateFileURI(textureType: TEXTURE_TYPES): string {
    let fileURI = Config.IMAGES_BODY_URI;

    if (textureType === TEXTURE_TYPES.COLOR) {
      fileURI += this.skin?.fileBaseColor;
    }

    if (textureType === TEXTURE_TYPES.NORMAL) {
      fileURI += this.skin?.fileNormals;
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
