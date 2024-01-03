import { useHelper } from '@react-three/drei';
import { folder, useControls } from 'leva';
import { useRef } from 'react';
import { DirectionalLight, DirectionalLightHelper } from 'three';

function Lighting() {
  const refDirLight = useRef<DirectionalLight>(null!);

  const lightCtl = useControls(
    'Lighting',
    {
      Ambient: folder({
        ambientVisible: { value: true, label: 'Visible' },
        ambientIntensity: { value: 1, min: 0, max: 5, label: 'Intensity' },
      }),
      Directional: folder({
        directionalVisible: { value: true, label: 'Visible' },
        directionalPosition: {
          value: {
            x: 10,
            y: 10,
            z: 20,
          },
          label: 'Position',
        },
        directionalIntensity: {
          value: 1,
          min: 0,
          max: 5,
          label: 'Intensity',
        },
        directionalCastShadow: { value: true, label: 'Cast Shadow' },
        Helper: folder(
          {
            directionalHelperVisible: { value: false, label: 'Visible' },
            directionalHelperColor: { value: '#f00', label: 'Color' },
            directionalHelperSize: { value: 1, min: 0, max: 5, label: 'Size' },
          },
          { collapsed: true },
        ),
      }),
      Hemisphere: folder({
        hemisphereVisible: { value: true, label: 'Visible' },
        hemisphereColorA: { value: '#fff', label: 'Color A' },
        hemisphereColorB: { value: '#333', label: 'Color B' },
        hemisphereIntensity: { value: 1, min: 0, max: 5, label: 'Intensity' },
      }),
    },
    { collapsed: true },
  );

  // const spotCtl = useControls("Spot Light", {
  //   visible: true,
  //   position: {
  //     x: 10,
  //     y: 40,
  //     z: 10,
  //   },
  //   angle: Math.PI / 3,
  //   penumbra: 0,
  //   castShadow: true,
  // });

  // const pointCtl = useControls("Point Light", {
  //   visible: false,
  //   position: {
  //     x: 2,
  //     y: 0,
  //     z: 0,
  //   },
  //   castShadow: true,
  // });

  useHelper(
    lightCtl.directionalHelperVisible ? refDirLight : false,
    DirectionalLightHelper,
    lightCtl.directionalIntensity,
    lightCtl.directionalHelperColor,
  );

  // useHelper(
  //   refDirLight,
  //   DirectionalLightHelper,
  //   lightCtl.directionalHelperSize,
  //   lightCtl.directionalHelperColor
  // );

  return (
    <>
      <ambientLight
        visible={lightCtl.ambientVisible}
        intensity={lightCtl.ambientIntensity}
      />
      <hemisphereLight
        args={[lightCtl.hemisphereColorA, lightCtl.hemisphereColorB]}
        intensity={lightCtl.hemisphereIntensity}
        visible={lightCtl.hemisphereVisible}
      />
      <directionalLight
        ref={refDirLight}
        visible={lightCtl.directionalVisible}
        intensity={lightCtl.directionalIntensity}
        position={[
          lightCtl.directionalPosition.x,
          lightCtl.directionalPosition.y,
          lightCtl.directionalPosition.z,
        ]}
        castShadow={lightCtl.directionalCastShadow}
      />
      {/* <directionalLightHelper light={dirLight} /> */}
      {/* <pointLight
        visible={pointCtl.visible}
        position={[
          pointCtl.position.x,
          pointCtl.position.y,
          pointCtl.position.z,
        ]}
        castShadow={pointCtl.castShadow}
      />*/}
      {/*<spotLight
        visible={spotCtl.visible}
        position={[spotCtl.position.x, spotCtl.position.y, spotCtl.position.z]}
        angle={spotCtl.angle}
        penumbra={spotCtl.penumbra}
        castShadow={spotCtl.castShadow}
      /> */}
    </>
  );
}

export default Lighting;
