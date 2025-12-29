import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { catchAsync } from '../../utils/catchAsync';
import { UserRole } from '@prisma/client';
const usersService = new UsersService();

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await usersService.createUser(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { user }
  });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 12, search, role } = req.query;
  
  

const result = await usersService.getUsers({
  page: Number(page),
  limit: Math.min(Number(limit), 50),
  search: search as string,
  role: role ? (role as UserRole) : undefined,
});

  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await usersService.getUserById(id);
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await usersService.updateUser(id, req.body);
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await usersService.deleteUser(id);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});