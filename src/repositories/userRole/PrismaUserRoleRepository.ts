import { injectable, inject } from 'tsyringe';
import { UserRole, Prisma, Role } from '../../generated/prisma';
import { IUserRoleRepository } from './IUserRoleRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaUserRoleRepository implements IUserRoleRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async findUserRoleByUserIdAndCompanyId(
    userId: string,
    companyId: string
  ): Promise<(UserRole & { role: Role }) | null> {
    return this.prisma.userRole.findFirst({
      where: { userId, companyId },
      include: { role: true },
    });
  }

  async create(data: Prisma.UserRoleCreateInput): Promise<UserRole> {
    return this.prisma.userRole.create({ data });
  }

  async findById(id: string): Promise<UserRole | null> {
    return this.prisma.userRole.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
        company: true,
      },
    });
  }

  async findByCompanyId(companyId: string): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { companyId },
    });
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { roleId },
    });
  }

  async delete(id: string): Promise<UserRole> {
    return this.prisma.userRole.delete({ where: { id } });
  }
}
