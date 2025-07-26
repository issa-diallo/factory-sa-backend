import { container } from 'tsyringe';
import { PackingListService } from './services/packingList/packingListService';
import { IPackingListService } from './services/packingList/interfaces';
import { ICompanyService } from './services/company/interfaces';
import { CompanyService } from './services/company/companyService';
import { IDomainService } from './services/domain/interfaces';
import { DomainService } from './services/domain/domainService';
import { PrismaClient } from './generated/prisma';

container.registerSingleton<IPackingListService>(
  'PackingListService',
  PackingListService
);
container.registerSingleton<ICompanyService>('CompanyService', CompanyService);
container.registerSingleton<IDomainService>('DomainService', DomainService);

const prisma = new PrismaClient();
container.registerInstance(PrismaClient, prisma);

export { container };
