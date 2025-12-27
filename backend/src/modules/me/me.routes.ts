import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { changePassword, updateProfile } from './me.controller';
import { changePasswordSchema, updateProfileSchema } from './me.validation';

const router = Router();

router.use(authenticate);

router.put('/password', validate(changePasswordSchema), changePassword);
router.put('/profile', validate(updateProfileSchema), updateProfile);

export default router;
