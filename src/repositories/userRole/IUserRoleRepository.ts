import { UserRole, Prisma, Role } from '../../generated/prisma';

export interface IUserRoleRepository {
  findUserRoleByUserIdAndCompanyId(
    userId: string,
    companyId: string
  ): Promise<(UserRole & { role: Role }) | null>;
  create(data: Prisma.UserRoleCreateInput): Promise<UserRole>;
  findById(id: string): Promise<UserRole | null>;
  findByUserId(userId: string): Promise<UserRole[]>;
  findByCompanyId(companyId: string): Promise<UserRole[]>;
  findByRoleId(roleId: string): Promise<UserRole[]>;
  delete(id: string): Promise<UserRole>;
}
