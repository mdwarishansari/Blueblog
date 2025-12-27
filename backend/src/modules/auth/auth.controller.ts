import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { catchAsync } from '../../utils/catchAsync';

const authService = new AuthService();


export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(
    req.user!.id,
    currentPassword,
    newPassword
  );
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const logoutAll = catchAsync(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.id);
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out from all devices'
  });
});