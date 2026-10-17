import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { App } from '../app/App';
import { routes } from '../app/router';
import { createAppStore } from '../app/store';
import { captureAttribution, captureOnNavigation } from '../features/attribution';

// Renders the full app at the given URL, wired like main.tsx: a fresh store,
// attribution captured from the landing URL, then on every navigation.
export function renderRoute(url: string) {
  const store = createAppStore();
  captureAttribution(store.dispatch, new URL(url, window.location.origin).search);

  const router = createMemoryRouter(routes, { initialEntries: [url] });
  captureOnNavigation(router, store.dispatch);

  return { router, store, ...render(<App router={router} store={store} />) };
}
