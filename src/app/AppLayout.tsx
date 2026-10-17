import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import { useState } from 'react';
import { Link as RouterLink, NavLink, Outlet } from 'react-router';
import { Logo } from '../shared/ui';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/account', label: 'Account', end: false },
] as const;

// Header, navigation and the page outlet. The modal gate and <ModalRenderer/>
// are added here in later stages; the signed-in state of the header in Stage 7.
export function AppLayout() {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = () => setMenuAnchor(null);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <Box component={RouterLink} to="/" sx={{ display: 'inline-flex', mr: 'auto', textDecoration: 'none' }}>
              <Logo />
            </Box>

            <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
              {NAV_LINKS.map(({ to, label, end }) => (
                <Button
                  key={to}
                  component={NavLink}
                  to={to}
                  end={end}
                  color="inherit"
                  sx={{ color: 'text.secondary', '&.active': { color: 'primary.main' } }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            <ThemeToggle />

            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Sign up
            </Button>

            <IconButton
              aria-label="Open menu"
              aria-haspopup="true"
              aria-expanded={menuAnchor ? 'true' : undefined}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              color="inherit"
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
              {NAV_LINKS.map(({ to, label }) => (
                <MenuItem key={to} component={RouterLink} to={to} onClick={closeMenu}>
                  {label}
                </MenuItem>
              ))}
              <MenuItem component={RouterLink} to="/register" onClick={closeMenu}>
                Sign up
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1, py: { xs: 4, md: 7 } }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
