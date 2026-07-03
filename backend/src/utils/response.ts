import { Response } from 'express';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types';

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message: string = 'Data retrieved successfully'
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  res.status(200).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  details?: unknown
): void {
  const response: ApiResponse = {
    success: false,
    message,
    ...(details ? { errors: details } : {}),
  };
  res.status(statusCode).json(response);
}

export function sendValidationError(res: Response, errors: unknown): void {
  const response: ApiResponse = {
    success: false,
    message: 'Validation failed',
    errors,
  };
  res.status(422).json(response);
}
