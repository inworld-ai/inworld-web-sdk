import { Object3D } from 'three';

export function ListChildren(model: Object3D) {
  console.log('Listing children for Object3D:', model.name);

  for (let i in model.children) {
    console.log('--> ', i, model.children[i].name);
  }
}
