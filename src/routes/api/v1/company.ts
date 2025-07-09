import { Router } from 'express';
import { CompanyController } from '../../../controllers/companyController';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';

const router: Router = Router();

router.post(
  '/',
  authenticate,
  authorize(['company:create']),
  CompanyController.createCompany
);
router.get(
  '/',
  authenticate,
  authorize(['company:read']),
  CompanyController.getAllCompanies
);
router.get(
  '/:id',
  authenticate,
  authorize(['company:read']),
  CompanyController.getCompanyById
);
router.put(
  '/:id',
  authenticate,
  authorize(['company:update']),
  CompanyController.updateCompany
);
router.delete(
  '/:id',
  authenticate,
  authorize(['company:delete']),
  CompanyController.deleteCompany
);

export default router;
