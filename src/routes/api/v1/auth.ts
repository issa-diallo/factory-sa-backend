import { Router } from 'express';
import { AuthController } from '../../../controllers/authController';
import { authenticate } from '../../../middlewares/authenticate';
import { container } from 'tsyringe';
import {
  loginRateLimiter,
  logoutRateLimiter,
} from '../../../middlewares/rateLimiter';

const router: Router = Router();
const authController = container.resolve(AuthController);

router.post(
  '/login',
  loginRateLimiter,
  authController.login.bind(authController)
);
router.post(
  '/logout',
  logoutRateLimiter,
  authenticate,
  authController.logout.bind(authController)
);

export default router;
