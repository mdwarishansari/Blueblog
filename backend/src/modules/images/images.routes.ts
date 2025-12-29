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

// ✅ upload allowed for all
router.post(
  '/upload',
  authorize('ADMIN', 'EDITOR', 'WRITER'),
  upload.single('file'),     // ✅ FIRST
  uploadImage
  
)
;

// ❌ only admin/editor can manage images
router.get('/', authorize('ADMIN', 'EDITOR'), getImages);
router.get('/:id', authorize('ADMIN', 'EDITOR'), getImage);
router.put('/:id', authorize('ADMIN', 'EDITOR'), validate(updateImageSchema), updateImage);
router.delete('/:id', authorize('ADMIN', 'EDITOR'), deleteImage);


export default router;