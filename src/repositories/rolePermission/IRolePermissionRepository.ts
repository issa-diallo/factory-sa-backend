import { RolePermission, Prisma } from '../../generated/prisma';

export interface IRolePermissionRepository {
  findRolePermissionsByRoleId(
    roleId: string
  ): Promise<(RolePermission & { permission: { name: string } })[]>;
  create(data: Prisma.RolePermissionCreateInput): Promise<RolePermission>;
  findById(id: string): Promise<RolePermission | null>;
  delete(id: string): Promise<RolePermission>;
}
