/* eslint-disable */
import { RepeatWrapping, SRGBColorSpace, Texture, TextureLoader } from 'three';

import { IFileLoader } from './IFileLoader';

export interface TextureFileLoaderProps {
  fileURI: string;
}

export class TextureFileLoader implements IFileLoader {
  callback?: Function;
  fileURI: string;
  isLoaded: Boolean = false;
  texture?: Texture;
  textureLoader: TextureLoader;

  constructor(props: TextureFileLoaderProps) {
    this.fileURI = props.fileURI;
    this.textureLoader = new TextureLoader();
    this.onLoad = this.onLoad.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onError = this.onError.bind(this);
  }

  public getTexture(): Texture | undefined {
    return this.texture;
  }

  public load(callback: Function) {
    this.callback = callback;
    this.textureLoader.load(this.fileURI, this.onLoad, undefined, this.onError);
  }

  private onError(error: unknown) {
    throw new Error('Error loading texture file ' + this.fileURI + ' ' + error);
  }

  private onLoad(texture: Texture) {
    this.texture = texture;
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.flipY = false;
    this.isLoaded = true;
    this.callback!();
  }

  private onUpdate(event: ProgressEvent) {
    // console.log('GLTFModelLoader onUpdate', event);
  }
}
