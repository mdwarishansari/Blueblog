import { Request, Response } from 'express';
import prisma from '../../config/database';

export const getSettings = async (_: Request, res: Response) => {
  const settings = await prisma.setting.findMany();
  res.json({ status: 'success', data: settings });
};

export const updateSettings = async (req: Request, res: Response) => {
  const updates = req.body;

  for (const key of Object.keys(updates)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(updates[key]) },
      create: { key, value: String(updates[key]) },
    });
  }

  res.json({ status: 'success', message: 'Settings updated' });
};
