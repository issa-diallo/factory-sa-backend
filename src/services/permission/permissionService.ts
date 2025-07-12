import { IPermissionService } from './interfaces';
import {
  Permission,
  PrismaClient,
  RolePermission,
} from '../../generated/prisma';
import {
  CreatePermissionRequest,
  CreateRolePermissionRequest,
  UpdatePermissionRequest,
} from '../../types/permission';

export class PermissionService implements IPermissionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return this.prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest
  ): Promise<Permission> {
    return this.prisma.permission.update({
      where: { id },
      data,
    });
  }

  async deletePermission(id: string): Promise<Permission> {
    return this.prisma.permission.delete({
      where: { id },
    });
  }

  async createRolePermission(
    data: CreateRolePermissionRequest
  ): Promise<RolePermission> {
    return this.prisma.rolePermission.create({
      data: {
        roleId: data.roleId,
        permissionId: data.permissionId,
      },
    });
  }

  async getRolePermissionById(id: string): Promise<RolePermission | null> {
    return this.prisma.rolePermission.findUnique({
      where: { id },
    });
  }

  async getRolePermissionsByRoleId(roleId: string): Promise<RolePermission[]> {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
    });
  }

  async getRolePermissionsByPermissionId(
    permissionId: string
  ): Promise<RolePermission[]> {
    return this.prisma.rolePermission.findMany({
      where: { permissionId },
    });
  }

  async deleteRolePermission(id: string): Promise<RolePermission> {
    return this.prisma.rolePermission.delete({
      where: { id },
    });
  }
}
