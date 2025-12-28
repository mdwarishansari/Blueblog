import { Router } from 'express';
import multer from 'multer';
import {
  uploadImage,
  getImage,
  updateImage,
  deleteImage,
  getImages
} from './images.controller';
import { validate } from '../../middleware/validate.middleware';
import { uploadImageSchema, updateImageSchema } from './images.validation';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop() || '');
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Protected routes
router.use(authenticate);
router.use(authorize('WRITER', 'EDITOR', 'ADMIN'));

router.post(
  '/upload',
  createRateLimiter,
  upload.single('file'),
  validate(uploadImageSchema),
  uploadImage
);

router.get('/', getImages);
router.get('/:id', getImage);
router.put('/:id', validate(updateImageSchema), updateImage);
router.delete('/:id', deleteImage);

export default router;