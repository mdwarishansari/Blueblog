import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { ValidationError } from '../../utils/appError';
import { catchAsync } from '../../utils/catchAsync';

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ValidationError('User not found');

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new ValidationError('Current password is incorrect');

  if (newPassword.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash },
  });

  await prisma.refreshToken.deleteMany({ where: { userId } });

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});

export const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.id

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: req.body.name,
      bio: req.body.bio,
      profileImage: req.body.profileImage,
    },
  })

  res.status(200).json({
    status: 'success',
    data: user,
  })
})
