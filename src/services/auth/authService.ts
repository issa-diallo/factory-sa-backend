import { Request } from 'express';
import { IPasswordService, ITokenService } from './interfaces';
import { IAuthService } from './interfaces';
import {
  CompanyDomain,
  Domain,
  PrismaClient,
  RolePermission,
  User,
  UserRole,
} from '../../generated/prisma';
import { LoginResponse } from '../../types/auth';
import { getClientIp } from '../../utils/getClientIp';

export class AuthService implements IAuthService {
  private prisma: PrismaClient;
  private passwordService: IPasswordService;
  private tokenService: ITokenService;

  constructor(
    prisma: PrismaClient,
    passwordService: IPasswordService,
    tokenService: ITokenService
  ) {
    this.prisma = prisma;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async login(
    email: string,
    password: string,
    req: Request
  ): Promise<LoginResponse> {
    const normalizedEmail = email.toLowerCase();
    const domain = normalizedEmail.split('@')[1];

    const domainEntity = await this.getActiveDomain(domain);
    const companyDomain = await this.getCompanyDomain(domainEntity.id);
    const user = await this.getActiveUserByEmail(normalizedEmail);
    await this.validatePassword(password, user.password);
    const { userRole, permissions } = await this.getUserRoleAndPermissions(
      user.id,
      companyDomain.companyId
    );

    const token = await this.tokenService.generateToken({
      userId: user.id,
      companyId: companyDomain.companyId,
      roleId: userRole.roleId,
      permissions,
    });

    await this.updateLastLogin(user.id, req);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async logout(token: string): Promise<void> {
    await this.tokenService.invalidateToken(token);
  }

  private async getActiveDomain(domain: string): Promise<Domain> {
    const normalizedDomain = domain.toLowerCase();

    const domainEntity = await this.prisma.domain.findFirst({
      where: { name: normalizedDomain, isActive: true },
    });

    if (!domainEntity) {
      throw new Error('Unauthorized or inactive domain');
    }

    return domainEntity;
  }

  private async getCompanyDomain(
    domainId: string
  ): Promise<CompanyDomain & { company: { isActive: boolean } }> {
    const companyDomain = await this.prisma.companyDomain.findFirst({
      where: { domainId },
      include: { company: true },
    });

    if (!companyDomain || !companyDomain.company.isActive) {
      throw new Error('Domain not associated with an active company');
    }

    return companyDomain;
  }

  private async getActiveUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or inactive user');
    }

    return user;
  }

  private async validatePassword(
    inputPassword: string,
    storedHash: string
  ): Promise<void> {
    const isValid = await this.passwordService.verify(
      inputPassword,
      storedHash
    );
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
  }

  private async getUserRoleAndPermissions(
    userId: string,
    companyId: string
  ): Promise<{ userRole: UserRole; permissions: string[] }> {
    const userRole = await this.prisma.userRole.findFirst({
      where: { userId, companyId },
      include: { role: true },
    });

    if (!userRole) {
      throw new Error('User has no role in this company');
    }

    const rolePermissions: (RolePermission & {
      permission: { name: string };
    })[] = await this.prisma.rolePermission.findMany({
      where: { roleId: userRole.roleId },
      include: { permission: true },
    });

    const permissions = rolePermissions.map(rp => rp.permission.name);

    return { userRole, permissions };
  }

  private async updateLastLogin(userId: string, req: Request): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: getClientIp(req),
      },
    });
  }
}
