import { MaterialLoader } from "./MaterialLoader";

export class MaterialsLoader {

    callback: Function;
    count: number = 0;

    constructor(materialFiles: {[key: string]: MaterialLoader | null;}, callback: Function) {
        this.callback = callback;
        this.onLoad = this.onLoad.bind(this);
        for (let i in materialFiles) {
            this.count++;
            materialFiles[i]?.load(this.onLoad);
        }
    }

    public onLoad() {
        this.count--;
        // console.log("MaterialsLoader: " + this.count);
        if (this.count == 0) {
            this.callback();
        }
    }

}