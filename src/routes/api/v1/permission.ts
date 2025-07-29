import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { PermissionController } from '../../../controllers/permissionController';
import { container } from 'tsyringe';

const router: Router = Router();
const permissionController = container.resolve(PermissionController);

router.post(
  '/',
  authenticate,
  authorize(['permission:create']),
  permissionController.createPermission
);
router.get(
  '/',
  authenticate,
  authorize(['permission:read']),
  permissionController.getAllPermissions
);
router.get(
  '/:id',
  authenticate,
  authorize(['permission:read']),
  permissionController.getPermissionById
);
router.put(
  '/:id',
  authenticate,
  authorize(['permission:update']),
  permissionController.updatePermission
);
router.delete(
  '/:id',
  authenticate,
  authorize(['permission:delete']),
  permissionController.deletePermission
);

router.post(
  '/role-permission',
  authenticate,
  authorize(['rolePermission:create']),
  permissionController.createRolePermission
);
router.delete(
  '/role-permission/:id',
  authenticate,
  authorize(['rolePermission:delete']),
  permissionController.deleteRolePermission
);

export default router;
