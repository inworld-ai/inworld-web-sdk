import { v4 } from 'uuid';

import { Character } from '../../src/entities/character.entity';

test('should get character fields', () => {
  const id = v4();
  const resourceName = v4();
  const displayName = v4();
  const assets = {
    avatarImg: v4(),
    avatarImgOriginal: v4(),
    rpmModelUri: v4(),
    rpmImageUriPortrait: v4(),
    rpmImageUriPosture: v4(),
  };
  const character = new Character({
    id,
    resourceName,
    displayName,
    assets,
  });

  expect(character.id).toEqual(id);
  expect(character.resourceName).toEqual(resourceName);
  expect(character.displayName).toEqual(displayName);
  expect(character.assets).toEqual(assets);

  expect(character.getId()).toEqual(id);
  expect(character.getResourceName()).toEqual(resourceName);
  expect(character.getDisplayName()).toEqual(displayName);
  expect(character.getAssets()).toEqual(assets);
});
