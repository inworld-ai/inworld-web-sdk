/* eslint-disable */
import { Texture, TextureLoader } from 'three';
import { AnimationFile } from '../../../types';

import { useEffect, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { Config } from '../../../../config';
import { GLTF, GLTFLoader } from 'three-stdlib';

export class TextureFileLoader {
  
  callback?: Function;
  fileURI: string;
  isLoaded: Boolean = false;
  texture?: Texture;
  textureLoader: TextureLoader;

  constructor( fileURI: string ) {
    this.fileURI = fileURI;
    this.textureLoader = new TextureLoader();
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
  }

  public getTexture(): Texture | undefined {
    return this.texture;
  }

  public load(callback: Function) {
    this.callback = callback;
    this.textureLoader.load( this.fileURI, this.onLoad, undefined, this.onError);
  }

  private onError(error: ErrorEvent) {
    throw new Error("Error loading texture file " + this.fileURI + " " + error);
  }

  private onLoad(texture: Texture) {
    this.texture = texture;
    this.texture.flipY = false;
    this.isLoaded = true;
    this.callback!();
  }

}
