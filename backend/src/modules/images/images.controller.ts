import { Request, Response } from 'express';
import { ImagesService } from './images.service';
import { catchAsync } from '../../utils/catchAsync';

const imagesService = new ImagesService();

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No image file provided'
    });
  }

  const image = await imagesService.uploadImage(req.file, req.body);
  
  res.status(201).json({
    status: 'success',
    data: { image }
  });
});

export const getImages = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 12, search } = req.query;
  
  const result = await imagesService.getImages({
    page: Number(page),
    limit: Math.min(Number(limit), 50),
    search: search as string
  });
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getImage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = await imagesService.getImageById(id);
  
  res.status(200).json({
    status: 'success',
    data: { image }
  });
});

export const updateImage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = await imagesService.updateImage(id, req.body);
  
  res.status(200).json({
    status: 'success',
    data: { image }
  });
});

export const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await imagesService.deleteImage(id);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});