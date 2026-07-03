import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthPayload } from '../types';
import { verifyToken } from '../utils/helpers';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('No authorization token provided'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new UnauthorizedError('Invalid authorization format. Use: Bearer <token>'));
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded as AuthPayload;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired'));
    }
    return next(new UnauthorizedError('Invalid or malformed token'));
  }
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded as AuthPayload;
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}
