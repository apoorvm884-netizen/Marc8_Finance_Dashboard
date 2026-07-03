import { RouterProvider } from 'react-router-dom';
import { Providers } from '@/providers';
import { router } from '@/routes';
import { GlobalErrorBoundary } from '@/components/shared/global-error-boundary';

export function App() {
  try {
    return (
      <GlobalErrorBoundary>
        <Providers>
          <RouterProvider router={router} />
        </Providers>
      </GlobalErrorBoundary>
    );
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Application Error</h1>
          <p className="text-sm text-secondary-400">
            The application failed to initialize. Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }
}
