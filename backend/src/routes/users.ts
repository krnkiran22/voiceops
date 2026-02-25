import { Router } from 'express';
import { getMe, updateMe, generateLinkCode, linkTelegram } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { botApiKey } from '../middleware/botApiKey';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.post('/generate-link-code', authMiddleware, generateLinkCode);
router.post('/link-telegram', botApiKey, linkTelegram);

export default router;
