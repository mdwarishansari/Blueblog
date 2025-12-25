import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field';
      error = new AppError(`${field} already exists`, 409);
    }
    
    // Record not found
    else if (prismaError.code === 'P2025') {
      error = new AppError('Record not found', 404);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const zodError = err as any;
    error = new AppError('Validation failed', 400);
    (error as any).errors = zodError.errors;
  }

  // Default to 500 server error
  if (!(error instanceof AppError)) {
    error = new AppError('Internal server error', 500);
  }

  // Send error response
  const appError = error as AppError;
  
  const errorResponse: any = {
    status: appError.status,
    message: appError.message,
    ...(config.env === 'development' && { stack: err.stack })
  };

  // Add validation errors if present
  if ((appError as any).errors) {
    errorResponse.errors = (appError as any).errors;
  }

  res.status(appError.statusCode).json(errorResponse);
};