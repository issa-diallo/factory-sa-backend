import { Router } from 'express';
import { AuthController } from '../../../controllers/authController';

const router: Router = Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout); // TODO Requires authentication middleware for protection

export default router;
