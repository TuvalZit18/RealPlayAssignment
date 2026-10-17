import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

// Protected in Stage 7; shows the signed-in user's details then.
export function AccountPage() {
  return (
    <Card sx={{ p: { xs: 3, md: 4 }, maxWidth: 560 }}>
      <Typography variant="h3" component="h1">
        Account
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Your account details appear here once you have signed up.
      </Typography>
    </Card>
  );
}
