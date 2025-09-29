import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { PackingListController } from '../../../controllers/packingListController';
import { container } from 'tsyringe';

const packingListRouter: Router = Router();
const packingListController = container.resolve(PackingListController);

packingListRouter.post(
  '/',
  authenticate,
  authorize(['packing_list:create']),
  packingListController.handlePackingList
);

export default packingListRouter;
