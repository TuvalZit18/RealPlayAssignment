import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../features/auth';

// Protected by <ProtectedRoute>, so a user is always present here.
export function AccountPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <Card sx={{ p: { xs: 3, md: 4 }, maxWidth: 560 }}>
      <Typography variant="h3" component="h1">
        Account
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        You're signed in.
      </Typography>
      <Stack component="dl" spacing={1.5} sx={{ m: 0 }}>
        {[
          ['Name', user?.name],
          ['Email', user?.email],
        ].map(([label, value]) => (
          <div key={label}>
            <Typography component="dt" variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography component="dd" sx={{ m: 0, fontWeight: 600 }}>
              {value}
            </Typography>
          </div>
        ))}
      </Stack>
    </Card>
  );
}
