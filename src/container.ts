import { container } from 'tsyringe';
import { PackingListService } from './services/packingList/packingListService';
import { IPackingListService } from './services/packingList/interfaces';

container.registerSingleton<IPackingListService>(
  'PackingListService',
  PackingListService
);

export { container };
