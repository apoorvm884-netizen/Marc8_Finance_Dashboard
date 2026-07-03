export const appConfig = {
  name: 'Fleet Financial Dashboard',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    maxPageSize: 100,
  },
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm:ss',
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },
  supportedLocales: ['en-IN', 'en-US'],
  defaultLocale: 'en-IN',
  theme: {
    default: 'dark' as const,
    storageKey: 'ffd-theme',
  },
  session: {
    storageKey: 'ffd-auth',
    timeout: 3600000,
  },
  debounceDelay: 300,
  upload: {
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  map: {
    defaultCenter: { lat: 20.5937, lng: 78.9629 },
    defaultZoom: 5,
  },
} as const;

export type AppConfig = typeof appConfig;
