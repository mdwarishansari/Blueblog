import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { getSettings, updateSettings } from './settings.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
