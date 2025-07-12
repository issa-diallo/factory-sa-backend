import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { RoleController } from '../../../controllers/roleController';

const router: Router = Router();

router.post(
  '/',
  authenticate,
  authorize(['role:create']),
  RoleController.createRole
);
router.get(
  '/',
  authenticate,
  authorize(['role:read']),
  RoleController.getAllRoles
);
router.get(
  '/:id',
  authenticate,
  authorize(['role:read']),
  RoleController.getRoleById
);
router.put(
  '/:id',
  authenticate,
  authorize(['role:update']),
  RoleController.updateRole
);
router.delete(
  '/:id',
  authenticate,
  authorize(['role:delete']),
  RoleController.deleteRole
);

export default router;
