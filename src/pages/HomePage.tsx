import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { TryItPanel } from './TryItPanel';

export function HomePage() {
  return (
    <Stack spacing={{ xs: 6, md: 8 }}>
      <Box component="section" sx={{ maxWidth: 640 }}>
        <Typography variant="overline" color="primary">
          RealPlay
        </Typography>
        <Typography variant="h1" sx={{ mt: 1 }}>
          Play for real.
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ mt: 2, fontWeight: 400 }}>
          Create your account in seconds and jump straight into the games.
        </Typography>
        <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ mt: 4 }}>
          Sign up
        </Button>
      </Box>

      <TryItPanel />
    </Stack>
  );
}
