import { Role, Prisma } from '../../generated/prisma';

export interface IRoleRepository {
  create(data: Prisma.RoleCreateInput): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(id: string, data: Prisma.RoleUpdateInput): Promise<Role>;
  delete(id: string): Promise<Role>;

  findSystemRoles(): Promise<Role[]>;
  findCustomRolesByCompany(companyId: string): Promise<Role[]>;
  findAllRolesForCompany(companyId: string): Promise<Role[]>;
  isSystemRole(roleId: string): Promise<boolean>;
  findRoleWithCompanyValidation(
    roleId: string,
    companyId: string
  ): Promise<Role | null>;
}
