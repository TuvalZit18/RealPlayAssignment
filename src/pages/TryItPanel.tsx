import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { useAppSelector } from '../app/hooks';
import { useAgeFirstTouch } from '../app/useAgeFirstTouch';
import { useResetDemo } from '../app/useResetDemo';
import { selectAttributionRecord, selectIsRegistered, type AttributionRecord } from '../features/attribution';
import { selectCurrentUser } from '../features/auth';

interface TryItLink {
  label: string;
  url: string;
  /** What should happen, shown in the info tooltip. */
  signedIn: string;
  signedOut: string;
}

const BACK_AFTER_SIGN_UP = 'Redirected to /register, then back here with the modal open after sign-up.';

// Ready-made URLs so reviewers can exercise every requirement in one click.
// The link navigates inside the app; the ↗ icon opens a new tab (a cold load,
// like arriving from an ad or email); the ⓘ icon explains what to expect.
const TRY_IT_LINKS: readonly TryItLink[] = [
  { label: 'Welcome modal', url: '/?welcome=1', signedIn: 'The Welcome modal opens.', signedOut: BACK_AFTER_SIGN_UP },
  {
    label: 'Promo modal',
    url: '/?promo=SUMMER25',
    signedIn: 'The Promo modal opens with code SUMMER25.',
    signedOut: BACK_AFTER_SIGN_UP,
  },
  {
    label: 'Invite modal',
    url: '/?invite=friend_42',
    signedIn: 'The Invite modal opens for friend_42.',
    signedOut: BACK_AFTER_SIGN_UP,
  },
  {
    label: 'Registration modal',
    url: '/?signup=1',
    signedIn: "The Registration modal opens and says you're already registered.",
    signedOut: BACK_AFTER_SIGN_UP,
  },
  {
    label: 'Two modals stacked',
    url: '/?welcome=1&promo=SUMMER25',
    signedIn: 'Welcome and Promo open stacked, Promo on top. Closing one leaves the other; Back reopens it.',
    signedOut: 'Redirected to /register, then back here with both modals open after sign-up.',
  },
  {
    label: 'Arrive from a Google ad',
    url: '/?utm_source=google&utm_medium=cpc&utm_campaign=fall_launch&gclid=Cj0KCQ-123',
    signedIn: 'Nothing is captured: you are already registered.',
    signedOut:
      'No modal, no redirect. Saved as the first touch if none is stored or the stored one is 30+ days old; otherwise ignored.',
  },
  {
    label: 'Arrive from a Facebook ad',
    url: '/?utm_source=facebook&utm_campaign=retarget&fbclid=IwAR-987',
    signedIn: 'Nothing is captured: you are already registered.',
    signedOut:
      'Ignored while a first touch under 30 days old exists (e.g. after the Google ad). Click "Age first touch by 30 days", then try again: Facebook replaces it.',
  },
  {
    label: 'Protected account page',
    url: '/account',
    signedIn: 'Your account details.',
    signedOut: 'Redirected to /register, then back to Account after sign-up.',
  },
];

/** Two lines: one for signed-in users, one for signed-out. */
function ExpectedTooltipContent({ signedIn, signedOut }: Pick<TryItLink, 'signedIn' | 'signedOut'>) {
  return (
    <Stack spacing={0.75} sx={{ py: 0.5 }}>
      <Typography variant="body2">
        <Box component="span" sx={{ fontWeight: 700 }}>
          Signed in:
        </Box>{' '}
        {signedIn}
      </Typography>
      <Typography variant="body2">
        <Box component="span" sx={{ fontWeight: 700 }}>
          Signed out:
        </Box>{' '}
        {signedOut}
      </Typography>
    </Stack>
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

function describeFirstTouch(record: AttributionRecord | null, registered: boolean): string {
  if (registered) return 'Registered: attribution is no longer captured';
  if (!record) return 'No first touch stored';
  const source = record.params.utm_source ?? record.params.ref ?? Object.keys(record.params)[0];
  const days = Math.max(0, Math.floor((Date.now() - record.firstTouchAt) / DAY_MS));
  return `First touch: ${source}, ${days === 1 ? '1 day' : `${days} days`} ago`;
}

/** Live summary of what the links react to, so results show without DevTools. */
function TryItStatus() {
  const user = useAppSelector(selectCurrentUser);
  const record = useAppSelector(selectAttributionRecord);
  const registered = useAppSelector(selectIsRegistered);

  return (
    <Box role="status" aria-live="polite" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      <Chip
        size="small"
        color={user ? 'primary' : 'default'}
        variant={user ? 'filled' : 'outlined'}
        label={user ? `Signed in as ${user.name}` : 'Signed out'}
      />
      <Chip size="small" variant="outlined" label={describeFirstTouch(record, registered)} />
    </Box>
  );
}

export function TryItPanel() {
  const resetDemo = useResetDemo();
  const { ageFirstTouch, canAge } = useAgeFirstTouch();

  return (
    <Card component="section" aria-labelledby="try-it-heading" sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography id="try-it-heading" variant="h4" component="h2">
        Try it
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Each link sets query params the app reacts to. Hover ⓘ to see what to expect, signed in and signed out. Use ↗
        to open the link in a new tab, like arriving from an ad or email.
      </Typography>

      <TryItStatus />

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {TRY_IT_LINKS.map(({ label, url, signedIn, signedOut }) => (
          <Box
            component="li"
            key={url}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 1.25, borderTop: 1, borderColor: 'divider' }}
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
            <Tooltip
              title={<ExpectedTooltipContent signedIn={signedIn} signedOut={signedOut} />}
              placement="left"
              enterTouchDelay={0}
              leaveTouchDelay={6000}
              slotProps={{ tooltip: { sx: { maxWidth: 360 } } }}
            >
              <IconButton aria-label={`What to expect: ${label}`} size="small" color="primary">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in a new tab (Cold Start)">
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

      <Stack spacing={1.5} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={ageFirstTouch} disabled={!canAge}>
            Age first touch by 30 days
          </Button>
          <Typography variant="body2" color="text.secondary">
            Simulates 30 days passing since the stored ad click, so the next ad link replaces it.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={resetDemo}>
            Reset demo
          </Button>
          <Typography variant="body2" color="text.secondary">
            Forgets your session and stored attribution, so you are a brand-new visitor again.
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
