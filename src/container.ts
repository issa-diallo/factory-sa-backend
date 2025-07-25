import { container } from 'tsyringe';
import { PackingListService } from './services/packingList/packingListService';
import { IPackingListService } from './services/packingList/interfaces';
import { ICompanyService } from './services/company/interfaces';
import { CompanyService } from './services/company/companyService';

container.registerSingleton<IPackingListService>(
  'PackingListService',
  PackingListService
);
container.registerSingleton<ICompanyService>('CompanyService', CompanyService);

export { container };
