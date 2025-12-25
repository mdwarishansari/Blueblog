import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/auth';
import { AuthenticationError, AuthorizationError } from '../utils/appError';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  // Check if user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, name: true }
  });

  if (!user) {
    throw new AuthenticationError('User no longer exists');
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  next();
});

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError();
    }

    next();
  };
};

// Helper function (will be defined in catchAsync file)
function catchAsync(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}