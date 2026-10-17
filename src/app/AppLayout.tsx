import { NavLink, Outlet } from 'react-router';

// Header, navigation and the page outlet. The modal gate and <ModalRenderer/>
// are added here in later stages. Styling comes in Stage 4 (UI foundation).
export function AppLayout() {
  return (
    <>
      <header>
        <nav aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>{' '}
          <NavLink to="/register">Register</NavLink> <NavLink to="/account">Account</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
