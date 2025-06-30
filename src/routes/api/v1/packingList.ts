import { Router } from 'express';
import { handlePackingList } from '@controllers/packingListController';

const packingListRouter: Router = Router();

packingListRouter.post('/packing-list', handlePackingList);

export default packingListRouter;
