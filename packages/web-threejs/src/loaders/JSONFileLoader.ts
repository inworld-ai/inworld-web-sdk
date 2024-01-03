import { IFileLoader } from './IFileLoader';

export interface JSONFileLoaderProps {
  fileURI: string;
}

export class JSONFileLoader implements IFileLoader {
  data: any;
  fileURI: string;

  constructor(props: JSONFileLoaderProps) {
    this.fileURI = props.fileURI;
  }

  async load(onLoad: Function, onError?: Function) {
    try {
      const file = await fetch(this.fileURI);
      this.data = await file.json();
      onLoad(this.data);
    } catch (e: unknown) {
      if (onError) {
        onError(e);
      } else {
        console.error(e);
      }
    }
  }
}
