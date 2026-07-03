import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rate-limiter';
import { loginSchema, changePasswordSchema, updateProfileSchema } from '../validators/auth';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/change-password', authenticate, authRateLimiter, validate(changePasswordSchema), authController.changePassword.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile.bind(authController));

export default router;
