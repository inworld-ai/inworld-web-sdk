import './App.css';

import { Container, Stack, Typography } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';

import { STATE_OPEN, useInworld } from '../contexts/InworldProvider';
import { useSystem } from '../contexts/SystemProvider';
import Scene from '../scene/Scene';
import ChatScreen from '../screens/ChatScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { config } from '../utils/config';

function App() {
  const { state } = useInworld();
  const { loading } = useSystem();

  const cameraRef = useRef<PerspectiveCamera>(
    new PerspectiveCamera(
      config.camera.fov,
      window.innerWidth / window.innerHeight,
      config.camera.near,
      config.camera.far,
    ),
  );

  useEffect(() => {
    cameraRef.current.position.set(
      config.camera.posX,
      config.camera.posY,
      config.camera.posZ,
    );
    cameraRef.current.lookAt(
      new Vector3(config.camera.tarX, config.camera.tarY, config.camera.tarZ),
    );
  }, [cameraRef.current]);

  return (
    <>
      {loading && <LoadingScreen />}
      {!loading && state === STATE_OPEN && <ChatScreen />}
      <Canvas
        className="mainCanvas"
        style={{ height: '100%', width: '100%' }}
        camera={cameraRef.current}
        shadows
      >
        <Scene />
      </Canvas>
      <Container className="mainLabel">
        <Stack
          className="stackLabel"
          justifyContent="space-between"
          direction="row"
        >
          <Typography className="textLabel">
            Inworld Web SDK - Three.js | Innequin React ver 2.1.0{' '}
          </Typography>
          <a href="https://www.inworld.ai">
            <img src="/logo-01.svg" color="white" width="120" height="30" />
          </a>
        </Stack>
      </Container>
    </>
  );
}

export default App;
