import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import { useState, type MouseEvent } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router';
import { selectCurrentUser, sessionEnded } from '../features/auth';
import { Logo } from '../shared/ui';
import { useAppDispatch, useAppSelector } from './hooks';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/account', label: 'Account', end: false },
] as const;

function useMenu() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return {
    anchor,
    open: (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget),
    close: () => setAnchor(null),
  };
}

export function AppHeader() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userMenu = useMenu();
  const mobileMenu = useMenu();

  // Leave the page first: ending the session while still on /account would
  // make <ProtectedRoute> redirect to /register. Data-router navigation is
  // async, so wait for it before ending the session.
  const signOut = async () => {
    userMenu.close();
    mobileMenu.close();
    await navigate('/');
    dispatch(sessionEnded());
  };

  return (
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

          {/* Desktop: Sign up, or the signed-in user's menu. */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user ? (
              <>
                <Button
                  color="inherit"
                  onClick={userMenu.open}
                  aria-haspopup="true"
                  aria-expanded={userMenu.anchor ? 'true' : undefined}
                  startIcon={
                    <Avatar sx={{ width: 26, height: 26, fontSize: 13, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                >
                  {user.name}
                </Button>
                <Menu anchorEl={userMenu.anchor} open={Boolean(userMenu.anchor)} onClose={userMenu.close}>
                  <MenuItem component={RouterLink} to="/account" onClick={userMenu.close}>
                    Account
                  </MenuItem>
                  <MenuItem onClick={signOut}>Sign out</MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={RouterLink} to="/register" variant="contained">
                Sign up
              </Button>
            )}
          </Box>

          {/* Phones: everything in one menu. */}
          <IconButton
            aria-label="Open menu"
            aria-haspopup="true"
            aria-expanded={mobileMenu.anchor ? 'true' : undefined}
            onClick={mobileMenu.open}
            color="inherit"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={mobileMenu.anchor} open={Boolean(mobileMenu.anchor)} onClose={mobileMenu.close}>
            {NAV_LINKS.map(({ to, label }) => (
              <MenuItem key={to} component={RouterLink} to={to} onClick={mobileMenu.close}>
                {label}
              </MenuItem>
            ))}
            <Divider />
            {user ? (
              <MenuItem onClick={signOut}>Sign out ({user.name})</MenuItem>
            ) : (
              <MenuItem component={RouterLink} to="/register" onClick={mobileMenu.close}>
                Sign up
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
