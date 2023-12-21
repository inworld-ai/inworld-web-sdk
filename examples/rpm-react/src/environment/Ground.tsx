import { Grid } from '@react-three/drei';
import { useControls } from 'leva';

function Ground() {
  const directionalCtl = useControls(
    'Ground',
    {
      visible: true,
      cellSize: 1,
      cellThickness: 0.75,
      cellColor: '#6f6f6f',
      sectionSize: 3,
      sectionThickness: 1,
      sectionColor: '#4600e2',
      fadeDistance: 30,
      fadeStrength: 1,
      followCamera: false,
      infiniteGrid: true,
    },
    { collapsed: true },
  );

  return (
    <>
      {directionalCtl.visible && (
        <Grid
          position={[0, -0.01, 0]}
          args={[10.5, 10.5]}
          {...directionalCtl}
        />
      )}
    </>
  );
}

export default Ground;
