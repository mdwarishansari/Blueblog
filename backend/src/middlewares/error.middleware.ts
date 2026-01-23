import { Request, Response, NextFunction } from 'express'

/* ------------------------------------------------------------------ */
/* AppError                                                           */
/* ------------------------------------------------------------------ */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

/* ------------------------------------------------------------------ */
/* Global Error Handler                                                */
/* ------------------------------------------------------------------ */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {

  // ✅ VERY IMPORTANT GUARD (tumhari main problem ka solution)
  if (!err || !err.message) {

    err = new Error('BUG: next() called without error')
    console.error('❌ BUG FOUND: next() was called without error')
    console.error(err.stack)
  }

  // LOG
  console.error('❌ Error:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    time: new Date().toISOString(),
  })

  const statusCode =
    err instanceof AppError && err.statusCode
      ? err.statusCode
      : 500

  const message =
    typeof err.message === 'string'
      ? err.message
      : 'Internal Server Error'

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry',
      })
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      })
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    })
  }

  // Zod errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues ?? [],
    })
  }

  // FINAL RESPONSE
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  })
}

/* ------------------------------------------------------------------ */
/* 404 Handler                                                         */
/* ------------------------------------------------------------------ */
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  })
}
