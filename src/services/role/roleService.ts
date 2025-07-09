import { IRoleService } from './interfaces';
import { PrismaClient, Role } from '../../generated/prisma';
import { CreateRoleRequest, UpdateRoleRequest } from '../../types/role';

export class RoleService implements IRoleService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async getAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async deleteRole(id: string): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
