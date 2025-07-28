import { injectable, inject } from 'tsyringe';
import { Role, Prisma } from '../../generated/prisma';
import { IRoleRepository } from './IRoleRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }
}
