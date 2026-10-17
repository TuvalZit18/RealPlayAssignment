import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

export function NotFoundPage() {
  return (
    <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
      <Typography variant="overline" color="primary">
        404
      </Typography>
      <Typography variant="h2" component="h1" sx={{ mt: 1 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
        The page you are looking for doesn't exist.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 4 }}>
        Go to the home page
      </Button>
    </Box>
  );
}
