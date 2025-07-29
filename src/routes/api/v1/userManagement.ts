import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { UserManagementController } from '../../../controllers/userManagementController';
import { container } from 'tsyringe';

const router: Router = Router();
const userManagementController = container.resolve(UserManagementController);

router.post(
  '/',
  authenticate,
  authorize(['user:create']),
  userManagementController.createUser
);
router.get(
  '/',
  authenticate,
  authorize(['user:read']),
  userManagementController.getAllUsers
);
router.get(
  '/:id/roles',
  authenticate,
  authorize(['user:read']),
  userManagementController.getUserRoles
);
router.get(
  '/:id',
  authenticate,
  authorize(['user:read']),
  userManagementController.getUserById
);
router.put(
  '/:id',
  authenticate,
  authorize(['user:update']),
  userManagementController.updateUser
);
router.delete(
  '/:id',
  authenticate,
  authorize(['user:delete']),
  userManagementController.deleteUser
);

router.post(
  '/user-role',
  authenticate,
  authorize(['userRole:create']),
  userManagementController.createUserRole
);

router.delete(
  '/user-role/:id',
  authenticate,
  authorize(['userRole:delete']),
  userManagementController.deleteUserRole
);

export default router;
