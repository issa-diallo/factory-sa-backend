import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { UserManagementController } from '../../../controllers/userManagementController';

const router: Router = Router();

router.post(
  '/',
  authenticate,
  authorize(['user:create']),
  UserManagementController.createUser
);
router.get(
  '/',
  authenticate,
  authorize(['user:read']),
  UserManagementController.getAllUsers
);
router.get(
  '/:id/roles',
  authenticate,
  authorize(['user:read']),
  UserManagementController.getUserRoles
);
router.get(
  '/:id',
  authenticate,
  authorize(['user:read']),
  UserManagementController.getUserById
);
router.put(
  '/:id',
  authenticate,
  authorize(['user:update']),
  UserManagementController.updateUser
);
router.delete(
  '/:id',
  authenticate,
  authorize(['user:delete']),
  UserManagementController.deleteUser
);

router.post(
  '/user-role',
  authenticate,
  authorize(['userRole:create']),
  UserManagementController.createUserRole
);

router.delete(
  '/user-role/:id',
  authenticate,
  authorize(['userRole:delete']),
  UserManagementController.deleteUserRole
);

export default router;
