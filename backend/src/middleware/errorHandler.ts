import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: string[];
}

export const errorHandler: ErrorRequestHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    details: err.details,
  });

  const statusCode = err.status || 500;
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || [],
    },
  };

  res.status(statusCode).json(response);
};
