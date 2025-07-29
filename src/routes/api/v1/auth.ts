import { Router } from 'express';
import { AuthController } from '../../../controllers/authController';
import { authenticate } from '../../../middlewares/authenticate';
import { container } from 'tsyringe';

const router: Router = Router();
const authController = container.resolve(AuthController);

router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);

export default router;
