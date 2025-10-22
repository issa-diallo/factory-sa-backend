import { injectable, inject } from 'tsyringe';
import { Role, Prisma } from '../../generated/prisma';
import { IRoleRepository } from './IRoleRepository';
import { IPrismaService } from '../../database/interfaces';
import { RoleWithPermissionsResponse } from '../../types/role';

@injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async findByIdWithPermissions(
    id: string
  ): Promise<RoleWithPermissionsResponse | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return null;

    return {
      ...role,
      permissions: role.rolePermissions || [],
    };
  }

  async findByName(
    name: string,
    companyId: string | null
  ): Promise<Role | null> {
    if (companyId === null) {
      // For system roles with null companyId, use a findFirst with exact match
      return this.prisma.role.findFirst({
        where: {
          name,
          companyId: null,
        },
      });
    }

    // For company-specific roles, use the composite unique constraint
    return this.prisma.role.findUnique({
      where: {
        name_companyId: {
          name,
          companyId,
        },
      },
    });
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

  async findSystemRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      where: {
        name: {
          in: ['ADMIN', 'MANAGER', 'USER'],
        },
      },
    });
  }

  async findCustomRolesByCompany(companyId: string): Promise<Role[]> {
    return this.prisma.role.findMany({
      where: {
        AND: [
          {
            name: {
              notIn: ['ADMIN', 'MANAGER', 'USER'],
            },
          },
          {
            companyId,
          },
        ],
      },
    });
  }

  async findAllRolesForCompany(companyId: string): Promise<Role[]> {
    const systemRoles = await this.findSystemRoles();
    const customRoles = await this.findCustomRolesByCompany(companyId);
    return [...systemRoles, ...customRoles];
  }

  async findAvailableRolesForUser(userId: string): Promise<Role[]> {
    // Find the user's company through UserRole
    const userRole = await this.prisma.userRole.findFirst({
      where: { userId },
      select: { companyId: true },
    });

    if (!userRole) {
      // If user has no role assignment, return only system roles
      return this.findSystemRoles();
    }

    // Return system roles + roles from user's company
    return this.prisma.role.findMany({
      where: {
        OR: [
          { companyId: null }, // System roles
          { companyId: userRole.companyId }, // Company-specific roles
        ],
      },
    });
  }

  async isSystemRole(roleId: string): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { name: true },
    });

    if (!role) return false;

    return ['ADMIN', 'MANAGER', 'USER'].includes(role.name);
  }

  async findRoleWithCompanyValidation(
    roleId: string,
    companyId: string
  ): Promise<Role | null> {
    // Vérifier d'abord si c'est un rôle système (toujours accessible)
    const isSystem = await this.isSystemRole(roleId);
    if (isSystem) {
      return this.findById(roleId);
    }

    // Pour les rôles personnalisés, vérifier l'appartenance à l'entreprise
    return this.prisma.role.findFirst({
      where: {
        id: roleId,
        userRoles: {
          some: {
            companyId,
          },
        },
      },
    });
  }
}
