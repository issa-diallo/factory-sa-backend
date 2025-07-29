import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { RoleController } from '../../../controllers/roleController';
import { container } from 'tsyringe';

const router: Router = Router();
const roleController = container.resolve(RoleController);

router.post(
  '/',
  authenticate,
  authorize(['role:create']),
  roleController.createRole
);
router.get(
  '/',
  authenticate,
  authorize(['role:read']),
  roleController.getAllRoles
);
router.get(
  '/:id',
  authenticate,
  authorize(['role:read']),
  roleController.getRoleById
);
router.put(
  '/:id',
  authenticate,
  authorize(['role:update']),
  roleController.updateRole
);
router.delete(
  '/:id',
  authenticate,
  authorize(['role:delete']),
  roleController.deleteRole
);

export default router;
