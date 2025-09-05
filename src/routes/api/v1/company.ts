import { Router } from 'express';
import { CompanyController } from '../../../controllers/companyController';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import {
  requireOwnCompanyOrSystemAdmin,
  validateCompanyAccess,
  validateCompanyAccessInBody,
} from '../../../middlewares/companyAccess';
import { container } from 'tsyringe';

const router: Router = Router();
const companyController = container.resolve(CompanyController);

router.post(
  '/',
  authenticate,
  authorize(['company:create']),
  validateCompanyAccessInBody(),
  companyController.create
);
router.get(
  '/',
  authenticate,
  authorize(['company:read']),
  requireOwnCompanyOrSystemAdmin(),
  companyController.getAllCompanies
);
router.get(
  '/current',
  authenticate,
  authorize(['company:read']),
  companyController.getCurrentCompany
);
router.get(
  '/:id',
  authenticate,
  authorize(['company:read']),
  validateCompanyAccess(),
  companyController.getCompanyById
);
router.put(
  '/:id',
  authenticate,
  authorize(['company:update']),
  validateCompanyAccess(),
  validateCompanyAccessInBody(),
  companyController.updateCompany
);
router.delete(
  '/:id',
  authenticate,
  authorize(['company:delete']),
  validateCompanyAccess(),
  companyController.deleteCompany
);

export default router;
