import './Scene.css';

import { Stats } from '@react-three/drei';

import CameraController from '../camera/CameraController';
import Background from '../environment/Background';
import Ground from '../environment/Ground';
import Lighting from '../environment/Lighting';
import Shadows from '../environment/Shadows';
import InnequinModel from '../innequin/InnequinModel';

function Scene() {
  return (
    <>
      <Background />
      <Lighting />
      <CameraController />
      <Shadows />
      <Ground />
      <Stats />
      <InnequinModel />
    </>
  );
}

export default Scene;
