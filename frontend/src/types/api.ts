export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  stack?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SingleResponse<T> {
  data: T;
}
