import { SkinnedMesh } from 'three';

// This class is currently under construction. The asset system is coming in a future release.
import { AssetType } from '../InnequinConfiguration';

// Manages the states of assets
export class InnequinAssetController {
  static updateDisplayList(
    model: SkinnedMesh,
    assets: { [key: string]: AssetType },
  ) {
    for (const assetName in assets) {
      const assetMesh = model.getObjectByName(assetName);
      if (!assetMesh) return;
      assetMesh.visible = assets[assetName].enabled;
    }
  }
}
