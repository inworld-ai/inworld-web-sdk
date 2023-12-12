import "./Scene.css";

import { Stats } from "@react-three/drei";

import CameraController from "../camera/CameraController";
import Background from "../environment/Background";
import Ground from "../environment/Ground";
import Lighting from "../environment/Lighting";
import Shadows from "../environment/Shadows";
import RPMModel from "../rpm/RPMModel";

export type SceneProps = {};

function Scene(props: SceneProps) {
  return (
    <>
      <Background />
      <Lighting />
      <CameraController />
      <Shadows />
      <Ground />
      <Stats />
      <RPMModel />
    </>
  );
}

export default Scene;
