import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { Loader2 } from 'lucide-react';

function PageLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );
}

function lazyLoadPage(importFn: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const routes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <AuthLayout>{lazyLoadPage(() => import('@/pages/login'))}</AuthLayout>
      </ErrorBoundary>
    ),
  },
  {
    path: '/change-password',
    element: (
      <ErrorBoundary>
        <AuthLayout>{lazyLoadPage(() => import('@/pages/change-password'))}</AuthLayout>
      </ErrorBoundary>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: lazyLoadPage(() => import('@/pages/dashboard')),
          },
          {
            path: 'dashboard',
            element: lazyLoadPage(() => import('@/pages/dashboard')),
          },
          {
            path: 'bookings',
            element: lazyLoadPage(() => import('@/pages/bookings')),
          },
          {
            path: 'journal-ledger',
            element: lazyLoadPage(() => import('@/pages/journal')),
          },
          {
            path: 'expenses',
            element: lazyLoadPage(() => import('@/pages/expenses')),
          },
          {
            path: 'outstandings',
            element: lazyLoadPage(() => import('@/pages/outstanding')),
          },
          {
            path: 'analytics',
            element: lazyLoadPage(() => import('@/pages/analytics')),
          },
          {
            path: 'reports',
            element: lazyLoadPage(() => import('@/pages/reports')),
          },
          {
            path: 'notifications',
            element: lazyLoadPage(() => import('@/pages/notifications')),
          },
          {
            path: 'settings',
            element: lazyLoadPage(() => import('@/pages/settings')),
          },
          {
            path: 'masters/vehicles',
            element: lazyLoadPage(() => import('@/pages/vehicles')),
          },
          {
            path: 'fleet',
            element: lazyLoadPage(() => import('@/pages/fleet-dashboard')),
          },
          {
            path: 'fleet/financials/:id',
            element: lazyLoadPage(() => import('@/pages/vehicle-financials')),
          },
          {
            path: 'vendors',
            element: lazyLoadPage(() => import('@/pages/vendors')),
          },
          {
            path: 'maintenance',
            element: lazyLoadPage(() => import('@/pages/maintenance')),
          },
          {
            path: 'service-schedules',
            element: lazyLoadPage(() => import('@/pages/service-schedules')),
          },
          {
            path: 'vehicle-owners',
            element: lazyLoadPage(() => import('@/pages/vehicle-owners')),
          },
          {
            path: 'vehicle-owners/:id',
            element: lazyLoadPage(() => import('@/pages/vehicle-owner-detail')),
          },
          {
            path: 'settlements',
            element: lazyLoadPage(() => import('@/pages/settlements')),
          },
          {
            path: 'settlements/dashboard',
            element: lazyLoadPage(() => import('@/pages/settlement-dashboard')),
          },
          {
            path: 'settlements/:id',
            element: lazyLoadPage(() => import('@/pages/settlement-detail')),
          },
          {
            path: 'operations',
            element: lazyLoadPage(() => import('@/pages/operations')),
          },
          {
            path: 'tasks',
            element: lazyLoadPage(() => import('@/pages/tasks')),
          },
          {
            path: 'automation',
            element: lazyLoadPage(() => import('@/pages/automation')),
          },
          {
            path: 'masters/data/:type',
            element: lazyLoadPage(() => import('@/pages/master-data')),
          },
        ],
      },
    ],
  },
  {
    path: '/unauthorized',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          {lazyLoadPage(() => import('@/pages/unauthorized'))}
        </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '*',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          {lazyLoadPage(() => import('@/pages/not-found'))}
        </Suspense>
      </ErrorBoundary>
    ),
  },
];

export const router = createBrowserRouter(routes);
