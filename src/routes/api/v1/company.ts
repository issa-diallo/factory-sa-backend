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
  companyController.create.bind(companyController)
);
router.get(
  '/',
  authenticate,
  authorize(['company:read']),
  requireOwnCompanyOrSystemAdmin(),
  companyController.getAllCompanies.bind(companyController)
);
router.get(
  '/current',
  authenticate,
  authorize(['company:read']),
  companyController.getCurrentCompany.bind(companyController)
);
router.get(
  '/:id',
  authenticate,
  authorize(['company:read']),
  validateCompanyAccess(),
  companyController.getCompanyById.bind(companyController)
);
router.put(
  '/:id',
  authenticate,
  authorize(['company:update']),
  validateCompanyAccess(),
  validateCompanyAccessInBody(),
  companyController.updateCompany.bind(companyController)
);
router.delete(
  '/:id',
  authenticate,
  authorize(['company:delete']),
  validateCompanyAccess(),
  companyController.deleteCompany.bind(companyController)
);

export default router;
