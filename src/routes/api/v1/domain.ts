import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { DomainController } from '../../../controllers/domainController';

const router: Router = Router();

router.post(
  '/',
  authenticate,
  authorize(['domain:create']),
  DomainController.createDomain
);
router.get(
  '/',
  authenticate,
  authorize(['domain:read']),
  DomainController.getAllDomains
);
router.get(
  '/:id',
  authenticate,
  authorize(['domain:read']),
  DomainController.getDomainById
);
router.put(
  '/:id',
  authenticate,
  authorize(['domain:update']),
  DomainController.updateDomain
);
router.delete(
  '/:id',
  authenticate,
  authorize(['domain:delete']),
  DomainController.deleteDomain
);

router.post(
  '/company-domain',
  authenticate,
  authorize(['companyDomain:create']),
  DomainController.createCompanyDomain
);
router.delete(
  '/company-domain/:id',
  authenticate,
  authorize(['companyDomain:delete']),
  DomainController.deleteCompanyDomain
);

export default router;
