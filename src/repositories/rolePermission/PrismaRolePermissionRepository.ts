import { injectable, inject } from 'tsyringe';
import { RolePermission, Prisma } from '../../generated/prisma';
import { IRolePermissionRepository } from './IRolePermissionRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaRolePermissionRepository
  implements IRolePermissionRepository
{
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async findRolePermissionsByRoleId(
    roleId: string
  ): Promise<(RolePermission & { permission: { name: string } })[]> {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  async create(
    data: Prisma.RolePermissionCreateInput
  ): Promise<RolePermission> {
    return this.prisma.rolePermission.create({ data });
  }

  async findById(id: string): Promise<RolePermission | null> {
    return this.prisma.rolePermission.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<RolePermission> {
    return this.prisma.rolePermission.delete({ where: { id } });
  }
}
