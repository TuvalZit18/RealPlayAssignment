import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Navigate, Outlet } from 'react-router';
import { selectIsAuthenticated, useModalGateRedirect } from '../features/auth';
import { ModalRenderer } from '../features/modals';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import { useAppSelector } from './hooks';

// Header, page outlet, footer, the modal gate and the single global <ModalRenderer/>.
// See docs/architecture/auth.md for the gate.
export function AppLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const gateRedirect = useModalGateRedirect();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <Box component="main" sx={{ flex: 1, py: { xs: 4, md: 7 } }}>
        <Container maxWidth="lg">
          {/* Signed out + modal param: redirect instead of rendering the page. */}
          {gateRedirect ? <Navigate replace to={gateRedirect} /> : <Outlet />}
        </Container>
      </Box>

      <AppFooter />

      {isAuthenticated && <ModalRenderer />}
    </Box>
  );
}
