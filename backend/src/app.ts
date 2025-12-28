import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { requestLogger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimiter.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import postRoutes from './modules/posts/posts.routes';
import categoryRoutes from './modules/categories/categories.routes';
import imageRoutes from './modules/images/images.routes';
import { z } from 'zod';
import meRoutes from './modules/me/me.routes';
import settingsRoutes from './modules/settings/settings.routes';



export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    bio: z.string().optional(),
    profileImage: z.string().url().optional().or(z.literal('')),
  }),
});


const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));

// Rate limiting
app.use(generalRateLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/me', meRoutes);


app.use('/api/v1/settings', settingsRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});


// Error handler
app.use(errorHandler);

export default app;