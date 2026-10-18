import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const AUTHOR = 'Tuval Zitelbach';

const CONTACT_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tuval-zitelbach/', Icon: LinkedInIcon },
  { label: 'GitHub', href: 'https://github.com/TuvalZit18', Icon: GitHubIcon },
] as const;

const emphasisSx = { color: 'text.primary', fontWeight: 700 } as const;

export function AppFooter() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 2.5 }}>
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Built by{' '}
          <Box component="strong" sx={emphasisSx}>
            {AUTHOR}
          </Box>{' '}
          for{' '}
          <Box component="strong" sx={emphasisSx}>
            RealPlay
          </Box>
        </Typography>
        <Box component="nav" aria-label="Contact" sx={{ display: 'flex', gap: 1 }}>
          {CONTACT_LINKS.map(({ label, href, Icon }) => (
            <Button
              key={label}
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              startIcon={<Icon fontSize="small" />}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
