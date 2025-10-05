import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { DomainController } from '../../../controllers/domainController';
import { container } from 'tsyringe';

const router: Router = Router();
const domainController = container.resolve(DomainController);

router.post(
  '/',
  authenticate,
  authorize(['domain:create']),
  domainController.createDomain
);
router.get(
  '/',
  authenticate,
  authorize(['domain:read']),
  domainController.getAllDomains
);
router.get(
  '/:id',
  authenticate,
  authorize(['domain:read']),
  domainController.getDomainById
);
router.put(
  '/:id',
  authenticate,
  authorize(['domain:update']),
  domainController.updateDomain
);
router.delete(
  '/:id',
  authenticate,
  authorize(['domain:delete']),
  domainController.deleteDomain
);

router.post(
  '/company-domain',
  authenticate,
  authorize(['companyDomain:create']),
  domainController.createCompanyDomain
);
router.get(
  '/company/:companyId/domains',
  authenticate,
  authorize(['domain:read']),
  domainController.getCompanyDomainsByCompanyId
);
router.delete(
  '/company/:companyId/domain/:domainId',
  authenticate,
  authorize(['companyDomain:delete']),
  domainController.deleteCompanyDomain
);

export default router;
