import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { App } from '../app/App';
import { routes } from '../app/router';

// Renders the full app (providers + routes) at the given URL.
export function renderRoute(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  return { router, ...render(<App router={router} />) };
}
