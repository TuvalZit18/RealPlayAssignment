import '@fontsource-variable/inter';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { captureAttribution, captureOnNavigation } from '../features/attribution';
import { App } from './App';
import { routes } from './router';
import { createAppStore, startCrossTabSync } from './store';

// Bootstrap order matters; see docs/architecture/frontend.md. Attribution is
// captured before anything renders, so no redirect can drop campaign params.
async function bootstrap() {
  // 1. Mock API. There is no real backend, so mocks run in dev and preview.
  const { worker } = await import('../mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });

  // 2. Store, initialised from localStorage, kept in sync with other tabs.
  const store = createAppStore();
  startCrossTabSync(store);

  // 3. Capture attribution from the URL the visitor landed on.
  captureAttribution(store.dispatch, window.location.search);

  // 4. Router; every later navigation captures too.
  const router = createBrowserRouter(routes);
  captureOnNavigation(router, store.dispatch);

  // 5. Render.
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element #root not found');

  createRoot(rootElement).render(
    <StrictMode>
      <App router={router} store={store} />
    </StrictMode>,
  );
}

void bootstrap();
