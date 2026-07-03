import { appConfig } from '@/config';
import { STORAGE_KEYS } from '@/config/constants';
import { parseError } from '@/lib/utils';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: unknown;

  constructor(message: string, status: number, code: string = 'UNKNOWN_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

interface ApiClient {
  get: <T>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T>(url: string, body?: unknown, config?: RequestConfig) => Promise<T>;
  put: <T>(url: string, body?: unknown, config?: RequestConfig) => Promise<T>;
  patch: <T>(url: string, body?: unknown, config?: RequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function buildUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
  const baseUrl = url.startsWith('http') ? url : `${appConfig.apiUrl}${url}`;
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (stored) {
      const parsed = JSON.parse(stored) as { token?: string };
      return parsed.token ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

async function request<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    signal,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    skipAuth = false,
  } = config;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchUrl = buildUrl(url, params);

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(fetchUrl, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });

      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        const errorData = data as Record<string, unknown>;
        const message = parseError(errorData) || `Request failed with status ${response.status}`;
        const code = (errorData?.code as string) || `HTTP_${response.status}`;

        if (
          response.status === 401 &&
          !skipAuth &&
          !url.includes('/auth/refresh')
        ) {
          try {
            localStorage.removeItem(STORAGE_KEYS.AUTH);
          } catch {
            // localStorage may be unavailable
          }
          window.location.href = '/login';
        }

        throw new ApiError(message, response.status, code, data);
      }

      return (data as { data: T })?.data ?? (data as T);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(parseError(error));

      if (error instanceof ApiError && !RETRYABLE_STATUSES.has(error.status)) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      attempt++;
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  throw lastError ?? new ApiError('Request failed', 0);
}

export const api: ApiClient = {
  get: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'GET' }),
  post: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'POST', body }),
  put: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'PUT', body }),
  patch: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'PATCH', body }),
  delete: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'DELETE' }),
};
