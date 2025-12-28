import { Request, Response } from 'express';
import { PostsService } from './posts.service';
import { catchAsync } from '../../utils/catchAsync';

const postsService = new PostsService();

export const createPost = catchAsync(async (req: Request, res: Response) => {
  const post = await postsService.createPost({
    ...req.body,
    authorId: req.user!.id
  });
  
  res.status(201).json({
    status: 'success',
    data: { post }
  });
});

export const getPosts = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 12, search, category, author, status, sort } = req.query;
  
  const result = await postsService.getPosts({
  page: Number(page),
  limit: Math.min(Number(limit), 50),
  search: search as string,
  category: category as string,
  author: author as string,
  status: status as string,
  sort: sort as string,
  user: req.user
});

  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postsService.getPostById(id);
  
  res.status(200).json({
    status: 'success',
    data: { post }
  });
});

export const getPostBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const post = await postsService.getPostBySlug(slug);
  
  // Increment view count (you can implement this later)
  
  res.status(200).json({
    status: 'success',
    data: { post }
  });
});

export const updatePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postsService.updatePost(
    id,
    req.body,
    req.user!.id,
    req.user!.role
  );
  
  res.status(200).json({
    status: 'success',
    data: { post }
  });
});

export const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await postsService.deletePost(id);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const publishPost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const publishedAt = req.body?.publishedAt;

  const post = await postsService.publishPost(id, publishedAt);

  res.status(200).json({
    status: 'success',
    post
  });
});


export const unpublishPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postsService.unpublishPost(id);
  
  res.status(200).json({
    status: 'success',
    data: { post }
  });
});

export const getRelatedPosts = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;
  const posts = await postsService.getRelatedPosts(id, Number(limit));
  
  res.status(200).json({
    status: 'success',
    data: { posts }
  });
});