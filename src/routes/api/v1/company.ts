import { Router } from 'express';
import { CompanyController } from '../../../controllers/companyController';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { container } from 'tsyringe';

const router: Router = Router();
const companyController = container.resolve(CompanyController);

router.post(
  '/',
  authenticate,
  authorize(['company:create']),
  companyController.create
);
router.get(
  '/',
  authenticate,
  authorize(['company:read']),
  companyController.getAllCompanies
);
router.get(
  '/:id',
  authenticate,
  authorize(['company:read']),
  companyController.getCompanyById
);
router.put(
  '/:id',
  authenticate,
  authorize(['company:update']),
  companyController.updateCompany
);
router.delete(
  '/:id',
  authenticate,
  authorize(['company:delete']),
  companyController.deleteCompany
);

export default router;
