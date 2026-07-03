import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { GlobalErrorBoundary } from '@/components/shared/global-error-boundary';
import { App } from '@/app';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = `
    <div style="display:flex;min-height:100vh;align-items:center;justify-content:center;background:#020617;color:#f8fafc;font-family:sans-serif;">
      <div style="text-align:center;max-width:400px;">
        <h1 style="font-size:1.5rem;font-weight:bold;margin-bottom:0.5rem;">Application Error</h1>
        <p style="color:#94a3b8;font-size:0.875rem;">The application root element was not found. Please check that the HTML document is properly configured.</p>
      </div>
    </div>
  `;
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </StrictMode>
  );
}
