import { AnimationLoader } from "./AnimationLoader";

export class AnimationsLoader {

    callback: Function;
    count: number = 0;

    constructor(animationFiles: {[key: string]: AnimationLoader | null;}, callback: Function) {
        this.callback = callback;
        this.onLoad = this.onLoad.bind(this);
        for (let i in animationFiles) {
            this.count++;
            animationFiles[i]?.load(this.onLoad);
        }
    }

    public onLoad() {
        this.count--;
        // console.log("AnimationsLoader: " + this.count);
        if (this.count == 0) {
            this.callback();
        }
    }

}