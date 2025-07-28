import { container } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import { PackingListService } from './services/packingList/packingListService';
import { IPackingListService } from './services/packingList/interfaces';
import { CompanyService } from './services/company/companyService';
import { IDomainService } from './services/domain/interfaces';
import { DomainService } from './services/domain/domainService';
import { PrismaService } from './database/prismaClient';
import { IPrismaService } from './database/interfaces';
import { IUserRepository } from './repositories/user/IUserRepository';
import { PrismaUserRepository } from './repositories/user/PrismaUserRepository';
import { IDomainRepository } from './repositories/domain/IDomainRepository';
import { PrismaDomainRepository } from './repositories/domain/PrismaDomainRepository';
import { ICompanyDomainRepository } from './repositories/companyDomain/ICompanyDomainRepository';
import { PrismaCompanyDomainRepository } from './repositories/companyDomain/PrismaCompanyDomainRepository';
import { IUserRoleRepository } from './repositories/userRole/IUserRoleRepository';
import { PrismaUserRoleRepository } from './repositories/userRole/PrismaUserRoleRepository';
import { IRolePermissionRepository } from './repositories/rolePermission/IRolePermissionRepository';
import { PrismaRolePermissionRepository } from './repositories/rolePermission/PrismaRolePermissionRepository';
import { ICompanyRepository } from './repositories/company/ICompanyRepository';
import { PrismaCompanyRepository } from './repositories/company/PrismaCompanyRepository';
import { IPermissionRepository } from './repositories/permission/IPermissionRepository';
import { PrismaPermissionRepository } from './repositories/permission/PrismaPermissionRepository';
import { IRoleRepository } from './repositories/role/IRoleRepository';
import { PrismaRoleRepository } from './repositories/role/PrismaRoleRepository';
import { IPasswordService, ITokenService } from './services/auth/interfaces';
import { PasswordService } from './services/auth/passwordService';
import { TokenService } from './services/auth/tokenService';

container.registerSingleton<IPackingListService>(
  'PackingListService',
  PackingListService
);
container.registerSingleton<ICompanyRepository>(
  'CompanyService',
  CompanyService
);
container.registerSingleton<IDomainService>('DomainService', DomainService);

container.registerSingleton<IPrismaService>('IPrismaService', PrismaService);
container.registerSingleton<IUserRepository>(
  'IUserRepository',
  PrismaUserRepository
);
container.registerSingleton<IDomainRepository>(
  'IDomainRepository',
  PrismaDomainRepository
);
container.registerSingleton<ICompanyDomainRepository>(
  'ICompanyDomainRepository',
  PrismaCompanyDomainRepository
);
container.registerSingleton<IUserRoleRepository>(
  'IUserRoleRepository',
  PrismaUserRoleRepository
);
container.registerSingleton<IRolePermissionRepository>(
  'IRolePermissionRepository',
  PrismaRolePermissionRepository
);
container.registerSingleton<ICompanyRepository>(
  'ICompanyRepository',
  PrismaCompanyRepository
);
container.registerSingleton<IPermissionRepository>(
  'IPermissionRepository',
  PrismaPermissionRepository
);
container.registerSingleton<IRoleRepository>(
  'IRoleRepository',
  PrismaRoleRepository
);

container.register<number>('SALT_ROUNDS', {
  useValue: Number(process.env.SALT_ROUNDS) || 10,
});

container.register<typeof jwt>('JWT', { useValue: jwt });

container.registerSingleton<IPasswordService>(
  'IPasswordService',
  PasswordService
);
container.registerSingleton<ITokenService>('ITokenService', TokenService);

export { container };
