/* eslint-disable */
import { Texture, SRGBColorSpace } from 'three';

import { Config } from '../../../../config';
import { TextureFileLoader } from './TextureFileLoader';
import { BODY_TEXTURE_TYPE } from '../../../types';
import { MATERIAL_TYPES, TEXTURE_TYPES } from '../data/types';

// File constants
const PREFIX: string = 'Mannequin_';
const COLOR: string = '.BaseColor';
const NORMAL: string = '.Normal';
const EXT: string = '.jpg';

export class BodyMaterialLoader {
  callback?: Function;
  isLoaded: Boolean = false;
  bodyTextureType: BODY_TEXTURE_TYPE;
  materialType: MATERIAL_TYPES;
  textureFileLoaderColor: TextureFileLoader;
  textureFileLoaderNormal: TextureFileLoader;

  constructor(
    bodyTextureType: BODY_TEXTURE_TYPE,
    materialType: MATERIAL_TYPES,
  ) {
    this.bodyTextureType = bodyTextureType;
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
    let fileURI = Config.IMAGES_BODY_URI + PREFIX + this.bodyTextureType;

    if (textureType === TEXTURE_TYPES.COLOR) {
      fileURI += COLOR + EXT;
    }

    if (textureType === TEXTURE_TYPES.NORMAL) {
      fileURI += NORMAL + EXT;
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
      this.isLoaded = true;
      this.callback!();
    }
  }
}
