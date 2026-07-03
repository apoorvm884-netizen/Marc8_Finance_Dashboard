import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    const response: ErrorResponse = {
      success: false,
      message: err.message,
    };

    if (err instanceof ValidationError) {
      const validationErr = err as unknown as { errors?: unknown };
      if (validationErr.errors) {
        response.errors = validationErr.errors;
      }
    }

    if (env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    logger.warn('Zod validation error', { errors: formattedErrors });

    const response: ErrorResponse = {
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    };

    if (env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(422).json(response);
    return;
  }

  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    name: err.name,
  });

  const response: ErrorResponse = {
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  };

  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}
