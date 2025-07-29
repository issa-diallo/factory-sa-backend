import { Request } from 'express';
import { inject, injectable } from 'tsyringe';
import { IPasswordService, ITokenService } from './interfaces';
import { IAuthService } from './interfaces';
import {
  Domain,
  RolePermission,
  User,
  UserRole,
  Role,
} from '../../generated/prisma';
import { LoginResponse } from '../../types/auth';
import { getClientIp } from '../../utils/getClientIp';
import {
  NoRoleInCompanyError,
  InvalidCredentialsError,
  UserNotFoundError,
  CompanyNotFoundError,
  UserNotActiveError,
} from '../../errors/AuthErrors';
import { IUserRepository } from '../../repositories/user/IUserRepository';
import { IDomainRepository } from '../../repositories/domain/IDomainRepository';
import { ICompanyDomainRepository } from '../../repositories/companyDomain/ICompanyDomainRepository';
import { IUserRoleRepository } from '../../repositories/userRole/IUserRoleRepository';
import { IRolePermissionRepository } from '../../repositories/rolePermission/IRolePermissionRepository';

@injectable()
export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private domainRepository: IDomainRepository;
  private companyDomainRepository: ICompanyDomainRepository;
  private userRoleRepository: IUserRoleRepository;
  private rolePermissionRepository: IRolePermissionRepository;
  private passwordService: IPasswordService;
  private tokenService: ITokenService;

  constructor(
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IDomainRepository') domainRepository: IDomainRepository,
    @inject('ICompanyDomainRepository')
    companyDomainRepository: ICompanyDomainRepository,
    @inject('IUserRoleRepository') userRoleRepository: IUserRoleRepository,
    @inject('IRolePermissionRepository')
    rolePermissionRepository: IRolePermissionRepository,
    @inject('IPasswordService') passwordService: IPasswordService,
    @inject('ITokenService') tokenService: ITokenService
  ) {
    this.userRepository = userRepository;
    this.domainRepository = domainRepository;
    this.companyDomainRepository = companyDomainRepository;
    this.userRoleRepository = userRoleRepository;
    this.rolePermissionRepository = rolePermissionRepository;
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

    const user = await this.getActiveUserByEmail(normalizedEmail);
    await this.validatePassword(password, user.password);

    const domainEntity = await this.getActiveDomain(domain);

    const companyDomain =
      await this.companyDomainRepository.findByDomainIdWithCompany(
        domainEntity.id
      );
    if (!companyDomain || !companyDomain.company.isActive) {
      throw new CompanyNotFoundError();
    }

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

    const domainEntity: Domain | null =
      await this.domainRepository.findByDomainName(normalizedDomain);

    if (!domainEntity) {
      throw new UserNotFoundError();
    }

    return domainEntity;
  }

  private async getActiveUserByEmail(email: string): Promise<User> {
    const user: User | null = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError();
    }
    if (!user.isActive) {
      throw new UserNotActiveError();
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
      throw new InvalidCredentialsError();
    }
  }

  private async getUserRoleAndPermissions(
    userId: string,
    companyId: string
  ): Promise<{ userRole: UserRole; permissions: string[] }> {
    const userRole: (UserRole & { role: Role }) | null =
      await this.userRoleRepository.findUserRoleByUserIdAndCompanyId(
        userId,
        companyId
      );

    if (!userRole) {
      throw new NoRoleInCompanyError();
    }

    const rolePermissions: (RolePermission & {
      permission: { name: string };
    })[] = await this.rolePermissionRepository.findRolePermissionsByRoleId(
      userRole.roleId
    );

    const permissions = rolePermissions.map(rp => rp.permission.name);

    return { userRole, permissions };
  }

  private async updateLastLogin(userId: string, req: Request): Promise<void> {
    await this.userRepository.updateUserLastLogin(userId, getClientIp(req));
  }
}
