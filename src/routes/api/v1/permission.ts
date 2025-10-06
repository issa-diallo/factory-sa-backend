import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import {
  protectPermissionModification,
  validateRolePermissionAssignment,
  validateRolePermissionDeletion,
} from '../../../middlewares/permissionAccess';
import { PermissionController } from '../../../controllers/permissionController';
import { container } from 'tsyringe';

const router: Router = Router();
const permissionController = container.resolve(PermissionController);

router.post(
  '/',
  authenticate,
  authorize(['permission:create']),
  protectPermissionModification(),
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
  protectPermissionModification(),
  permissionController.updatePermission
);
router.delete(
  '/:id',
  authenticate,
  authorize(['permission:delete']),
  protectPermissionModification(),
  permissionController.deletePermission
);

router.post(
  '/role-permission',
  authenticate,
  authorize(['rolePermission:create']),
  validateRolePermissionAssignment(),
  permissionController.createRolePermission
);
router.delete(
  '/role-permission/:id',
  authenticate,
  authorize(['rolePermission:delete']),
  validateRolePermissionDeletion(),
  permissionController.deleteRolePermission
);

export default router;
