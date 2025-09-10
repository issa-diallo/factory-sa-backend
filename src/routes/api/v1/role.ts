import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { requireOwnCompanyOrSystemAdmin } from '../../../middlewares/companyAccess';
import {
  validateRoleCompanyAccess,
  protectSystemRoles,
  validateRoleCreation,
} from '../../../middlewares/roleAccess';
import { RoleController } from '../../../controllers/roleController';
import { container } from 'tsyringe';

const router: Router = Router();
const roleController = container.resolve(RoleController);

router.post(
  '/',
  authenticate,
  authorize(['role:create']),
  validateRoleCreation(),
  roleController.createRole
);
router.get(
  '/',
  authenticate,
  authorize(['role:read']),
  requireOwnCompanyOrSystemAdmin(),
  roleController.getAllRoles
);
router.get(
  '/:id',
  authenticate,
  authorize(['role:read']),
  validateRoleCompanyAccess(),
  roleController.getRoleById
);
router.put(
  '/:id',
  authenticate,
  authorize(['role:update']),
  protectSystemRoles(),
  validateRoleCompanyAccess(),
  roleController.updateRole
);
router.delete(
  '/:id',
  authenticate,
  authorize(['role:delete']),
  protectSystemRoles(),
  validateRoleCompanyAccess(),
  roleController.deleteRole
);

export default router;
