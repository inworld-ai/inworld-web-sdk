import { GLTF } from 'three-stdlib';

import { Assets } from '../data/assets';

export class AssetManager {
  static updateDisplayList(model: GLTF) {
    for (var i = 0; i < Assets.length; i++) {
      // console.log(i, Assets[i].name);
      const assetMesh = model.scene.children[0].getObjectByName(Assets[i].name);
      if (!assetMesh) return;
      assetMesh.visible = Assets[i].enabled;
    }
  }
}
