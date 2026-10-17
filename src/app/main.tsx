import '@fontsource-variable/inter';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { App } from './App';
import { routes } from './router';

// Bootstrap order matters; see docs/architecture/frontend.md.
// Attribution capture (before the router) and the store join in Stage 5.
async function bootstrap() {
  // 1. Mock API. There is no real backend, so mocks run in dev and preview.
  const { worker } = await import('../mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });

  // 2. Router.
  const router = createBrowserRouter(routes);

  // 3. Render.
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element #root not found');

  createRoot(rootElement).render(
    <StrictMode>
      <App router={router} />
    </StrictMode>,
  );
}

void bootstrap();
