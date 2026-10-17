import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../features/auth';
import { BRAND_VIOLET } from '../shared/ui';

const BENEFITS = ['Welcome bonus on sign-up', 'Invite friends and play together', 'Start playing in seconds'];

// Split screen: brand panel + form card, stacked on phones.
// The form is wired to the register mutation in Stage 8.
export function RegisterPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        borderRadius: 3,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        component="aside"
        sx={{
          p: { xs: 4, md: 6 },
          color: '#FFFFFF',
          background: `linear-gradient(145deg, ${BRAND_VIOLET} 0%, #2A1577 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h2" component="p">
          Join RealPlay.
        </Typography>
        <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0, mt: 3 }}>
          {BENEFITS.map((benefit) => (
            <Box component="li" key={benefit} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleIcon fontSize="small" sx={{ opacity: 0.9 }} />
              <Typography>{benefit}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Card variant="elevation" elevation={0} square sx={{ p: { xs: 4, md: 6 }, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
          {user ? (
            <>
              <Typography variant="h3" component="h1">
                You're already registered
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Signed in as {user.name}.
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button component={RouterLink} to="/account" variant="contained">
                  Go to your account
                </Button>
                <Button component={RouterLink} to="/" color="inherit">
                  Home
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h3" component="h1">
                Create your account
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                It takes about ten seconds.
              </Typography>
              <Stack component="form" spacing={2} noValidate onSubmit={(event) => event.preventDefault()}>
                <TextField label="Name" name="name" autoComplete="name" />
                <TextField label="Email" name="email" type="email" autoComplete="email" />
                <Button type="submit" variant="contained" size="large">
                  Create account
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}
