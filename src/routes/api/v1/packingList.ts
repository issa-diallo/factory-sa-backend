import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { PackingListController } from '../../../controllers/packingListController';

const packingListRouter: Router = Router();

packingListRouter.post(
  '/',
  authenticate,
  authorize(['packingList:create']),
  PackingListController.handlePackingList
);

export default packingListRouter;
