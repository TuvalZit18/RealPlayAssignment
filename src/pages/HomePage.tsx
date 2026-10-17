import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { useResetDemo } from '../app/useResetDemo';

// Ready-made URLs so reviewers can exercise every requirement in one click.
// "Open" navigates inside the app; the icon opens a new tab (a cold load).
const TRY_IT_LINKS = [
  { label: 'Welcome modal', url: '/?welcome=1' },
  { label: 'Promo modal', url: '/?promo=SUMMER25' },
  { label: 'Invite modal', url: '/?invite=friend_42' },
  { label: 'Registration modal', url: '/?signup=1' },
  { label: 'Two modals stacked', url: '/?welcome=1&promo=SUMMER25' },
  { label: 'Arrive from a Google ad', url: '/?utm_source=google&utm_medium=cpc&utm_campaign=fall_launch&gclid=Cj0KCQ-123' },
  { label: 'Arrive from a Facebook ad', url: '/?utm_source=facebook&utm_campaign=retarget&fbclid=IwAR-987' },
  { label: 'Protected account page', url: '/account' },
] as const;

export function HomePage() {
  const resetDemo = useResetDemo();

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

      <Card component="section" aria-labelledby="try-it-heading" sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography id="try-it-heading" variant="h4" component="h2">
          Try it
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Each link sets query params the app reacts to. Use the icon to open it in a new tab, like arriving from an
          ad or email.
        </Typography>

        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {TRY_IT_LINKS.map(({ label, url }) => (
            <Box
              component="li"
              key={url}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.25,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Link component={RouterLink} to={url} underline="hover" sx={{ fontWeight: 600 }}>
                  {label}
                </Link>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, monospace', overflowWrap: 'anywhere' }}
                >
                  {url}
                </Typography>
              </Box>
              <Tooltip title="Open in a new tab">
                <IconButton
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Open "${label}" in a new tab`}
                  size="small"
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" onClick={resetDemo}>
            Reset demo
          </Button>
          <Typography variant="body2" color="text.secondary">
            Forgets your session and stored attribution, so you are a brand-new visitor again.
          </Typography>
        </Box>
      </Card>
    </Stack>
  );
}
