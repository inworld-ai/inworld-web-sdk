import './LoadingScreen.css';

import { Container, LinearProgress, Stack, Typography } from '@mui/material';

import { useSystem } from '../contexts/SystemProvider';

function LoadingScreen() {
  const { loadingPercent, loadingPercentTotal } = useSystem();

  return (
    <Container className="containerLoading">
      <Stack className="stackLoading" direction="column" spacing={2}>
        <LinearProgress
          className="progressLoading"
          variant="buffer"
          value={loadingPercent}
          valueBuffer={loadingPercentTotal}
        />
        <Stack
          className="stackLoadingLabel"
          justifyContent="space-between"
          direction="row"
          spacing={2}
        >
          <Typography component="p">Loading...</Typography>
          <Typography component="p">{loadingPercent}%</Typography>
        </Stack>
      </Stack>
    </Container>
  );
}

export default LoadingScreen;
