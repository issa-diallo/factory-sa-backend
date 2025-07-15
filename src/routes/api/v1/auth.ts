import { Router } from 'express';
import { AuthController } from '../../../controllers/authController';
import { authenticate } from '../../../middlewares/authenticate';

const router: Router = Router();

router.post('/login', AuthController.login);
router.post('/logout', authenticate, AuthController.logout);

export default router;
