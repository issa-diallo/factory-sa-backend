import { IUserManagementService } from './interfaces';
import { normalizeEmail } from '../../utils/normalizeEmail';
import { IPasswordService } from '../auth/interfaces';
import {
  CreateUserRequest,
  CreateUserRoleRequest,
  UpdateUserRequest,
} from '../../types/userManagement';
import { PrismaClient, User, UserRole } from '../../generated/prisma';

export class UserManagementService implements IUserManagementService {
  private prisma: PrismaClient;
  private passwordService: IPasswordService;

  constructor(prisma: PrismaClient, passwordService: IPasswordService) {
    this.prisma = prisma;
    this.passwordService = passwordService;
  }

  async createUser(data: CreateUserRequest): Promise<Omit<User, 'password'>> {
    const hashedPassword = await this.passwordService.hash(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: normalizeEmail(data.email),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(
    id: string,
    data: UpdateUserRequest
  ): Promise<Omit<User, 'password'>> {
    if (data.email) {
      data.email = normalizeEmail(data.email);
    }

    if (data.password) {
      data.password = await this.passwordService.hash(data.password);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updatedUser;
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async createUserRole(data: CreateUserRoleRequest): Promise<UserRole> {
    return this.prisma.userRole.create({
      data: {
        userId: data.userId,
        companyId: data.companyId,
        roleId: data.roleId,
      },
    });
  }

  async getUserRoleById(id: string): Promise<UserRole | null> {
    return this.prisma.userRole.findUnique({
      where: { id },
    });
  }

  async getUserRolesByUserId(userId: string): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
        company: true,
      },
    });
  }

  async getUserRolesByCompanyId(companyId: string): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { companyId },
    });
  }

  async getUserRolesByRoleId(roleId: string): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { roleId },
    });
  }

  async deleteUserRole(id: string): Promise<UserRole> {
    return this.prisma.userRole.delete({
      where: { id },
    });
  }
}
