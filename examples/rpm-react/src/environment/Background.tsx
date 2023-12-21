import { Sky } from '@react-three/drei';
import { useControls } from 'leva';

function Background() {
  const directionalCtl = useControls(
    'Background',
    {
      visible: true,
      distance: 450000,
      sunPosition: [5, 1, 8],
      inclination: 0,
      azimuth: 0.25,
    },
    { collapsed: true },
  );
  return <>{directionalCtl.visible && <Sky {...directionalCtl} />}</>;
}

export default Background;
