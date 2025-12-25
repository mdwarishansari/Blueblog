import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { catchAsync } from '../../utils/catchAsync';

const categoriesService = new CategoriesService();

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoriesService.createCategory(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { category }
  });
});

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 12, search } = req.query;
  
  const result = await categoriesService.getCategories({
    page: Number(page),
    limit: Math.min(Number(limit), 50),
    search: search as string
  });
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await categoriesService.getCategoryById(id);
  
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

export const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const category = await categoriesService.getCategoryBySlug(slug);
  
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await categoriesService.updateCategory(id, req.body);
  
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await categoriesService.deleteCategory(id);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getCategoryPosts = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { page = 1, limit = 12 } = req.query;
  
  const result = await categoriesService.getCategoryPosts(
    slug,
    Number(page),
    Math.min(Number(limit), 50)
  );
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});