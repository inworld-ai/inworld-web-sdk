import { AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { folder, useControls } from 'leva';
import { memo } from 'react';

function Shadows() {
  const shadowCtl = useControls(
    'Shadow',
    {
      shadowFrames: { value: 100, label: 'Frames' },
      shadowOpacity: {
        value: 1,
        min: 0,
        max: 1,
        label: 'Opacity',
      },
      shadowColor: { value: '#9d4b4b', label: 'Color' },
      shadowColorBlend: { value: 0.5, label: 'Color Blend' },
      shadowAlphaTest: { value: 0.9, label: 'Alpha Test' },
      shadowScale: { value: 30, label: 'Scale' },
      Light: folder({
        shadowLightAmount: { value: 8, label: 'Amount' },
        shadowLightRadius: { value: 4, label: 'Radius' },
        shadowLightPosition: {
          value: {
            x: 5,
            y: 5,
            z: 10,
          },
          label: 'Position',
        },
      }),
    },
    { collapsed: true },
  );

  const Shadows = memo(() => (
    <AccumulativeShadows
      temporal
      frames={shadowCtl.shadowFrames}
      opacity={shadowCtl.shadowOpacity}
      color={shadowCtl.shadowColor}
      colorBlend={shadowCtl.shadowColorBlend}
      alphaTest={shadowCtl.shadowAlphaTest}
      scale={shadowCtl.shadowScale}
    >
      <RandomizedLight
        amount={shadowCtl.shadowLightAmount}
        radius={shadowCtl.shadowLightRadius}
        position={[5, 5, 10]}
      />
    </AccumulativeShadows>
  ));

  return <Shadows />;
}

export default Shadows;
