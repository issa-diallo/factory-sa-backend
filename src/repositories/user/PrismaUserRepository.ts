import { injectable, inject } from 'tsyringe';
import { User, Prisma } from '../../generated/prisma';
import { IUserRepository } from './IUserRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async updateUserLastLogin(
    userId: string,
    lastLoginIp: string | undefined
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: lastLoginIp,
      },
    });
  }

  async findUsersByCompany(companyId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            companyId: companyId,
          },
        },
      },
    });
  }

  async isUserInCompany(userId: string, companyId: string): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        companyId,
      },
    });
    return userRole !== null;
  }

  async getUserCompanyId(userId: string): Promise<string | null> {
    const userRole = await this.prisma.userRole.findFirst({
      where: { userId },
      select: { companyId: true },
    });
    return userRole?.companyId || null;
  }
}
