import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { PermissionController } from '../../../controllers/permissionController';

const router: Router = Router();

router.post(
  '/',
  authenticate,
  authorize(['permission:create']),
  PermissionController.createPermission
);
router.get(
  '/',
  authenticate,
  authorize(['permission:read']),
  PermissionController.getAllPermissions
);
router.get(
  '/:id',
  authenticate,
  authorize(['permission:read']),
  PermissionController.getPermissionById
);
router.put(
  '/:id',
  authenticate,
  authorize(['permission:update']),
  PermissionController.updatePermission
);
router.delete(
  '/:id',
  authenticate,
  authorize(['permission:delete']),
  PermissionController.deletePermission
);

router.post(
  '/role-permission',
  authenticate,
  authorize(['rolePermission:create']),
  PermissionController.createRolePermission
);
router.delete(
  '/role-permission/:id',
  authenticate,
  authorize(['rolePermission:delete']),
  PermissionController.deleteRolePermission
);

export default router;
