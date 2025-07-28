import { injectable, inject } from 'tsyringe';
import { Permission, Prisma } from '../../generated/prisma';
import { IPermissionRepository } from './IPermissionRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return this.prisma.permission.create({ data });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { name } });
  }

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async update(
    id: string,
    data: Prisma.PermissionUpdateInput
  ): Promise<Permission> {
    return this.prisma.permission.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Permission> {
    return this.prisma.permission.delete({ where: { id } });
  }
}
