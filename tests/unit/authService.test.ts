import { AuthService } from '../../src/services/auth/authService';
import {
  IPasswordService,
  ITokenService,
} from '../../src/services/auth/interfaces';
import { Request } from 'express';
import {
  NoRoleInCompanyError,
  InvalidCredentialsError,
  UserNotFoundError,
  CompanyNotFoundError,
  UserNotActiveError,
  DomainNotActiveError,
} from '../../src/errors/AuthErrors';
import { IUserRepository } from '../../src/repositories/user/IUserRepository';
import { IDomainRepository } from '../../src/repositories/domain/IDomainRepository';
import { ICompanyDomainRepository } from '../../src/repositories/companyDomain/ICompanyDomainRepository';
import { IUserRoleRepository } from '../../src/repositories/userRole/IUserRoleRepository';
import { IRolePermissionRepository } from '../../src/repositories/rolePermission/IRolePermissionRepository';
import {
  User,
  Domain,
  CompanyDomain,
  UserRole,
  RolePermission,
  Role,
} from '../../src/generated/prisma';

const mockPasswordService: jest.Mocked<IPasswordService> = {
  hash: jest.fn(),
  verify: jest.fn().mockResolvedValue(true),
};

const mockTokenService: jest.Mocked<ITokenService> = {
  generateToken: jest.fn().mockResolvedValue('mock_jwt_token'),
  verifyToken: jest.fn(),
  invalidateToken: jest.fn(),
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  updateUserLastLogin: jest.fn(),
  findUsersByCompany: jest.fn(),
  isUserInCompany: jest.fn(),
  getUserCompanyId: jest.fn(),
};

const mockDomainRepository: jest.Mocked<IDomainRepository> = {
  findById: jest.fn(),
  findByDomainName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
};

const mockCompanyDomainRepository: jest.Mocked<ICompanyDomainRepository> = {
  findByDomainId: jest.fn(),
  findByDomainIdWithCompany: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findByCompanyId: jest.fn(),
  findAllByDomainId: jest.fn(),
  findById: jest.fn(),
};

const mockUserRoleRepository: jest.Mocked<IUserRoleRepository> = {
  findUserRoleByUserIdAndCompanyId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByCompanyId: jest.fn(),
  findByRoleId: jest.fn(),
  delete: jest.fn(),
};

const mockRolePermissionRepository: jest.Mocked<IRolePermissionRepository> = {
  findRolePermissionsByRoleId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../src/utils/getClientIp', () => ({
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let req: Request;

  const mockData = {
    user: {
      id: 'user1',
      email: 'test@example.com',
      password: 'hashedpassword',
      isActive: true,
      firstName: 'Test',
      lastName: 'User',
    } as User,
    domain: { id: 'domain1', name: 'example.com', isActive: true } as Domain,
    companyDomain: {
      domainId: 'domain1',
      companyId: 'company1',
      company: { isActive: true },
    } as CompanyDomain & { company: { isActive: boolean } },
    userRole: {
      userId: 'user1',
      roleId: 'role1',
      companyId: 'company1',
      role: { name: 'Admin' },
    } as UserRole & { role: Role },
    permissions: [
      { permission: { name: 'read' } },
      { permission: { name: 'write' } },
    ] as (RolePermission & { permission: { name: string } })[],
  };

  beforeEach(() => {
    authService = new AuthService(
      mockUserRepository,
      mockDomainRepository,
      mockCompanyDomainRepository,
      mockUserRoleRepository,
      mockRolePermissionRepository,
      mockPasswordService,
      mockTokenService
    );
    req = {
      headers: {},
      connection: { remoteAddress: '127.0.0.1' },
    } as Request;
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully log in a user and return token and user info', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
      mockPasswordService.verify.mockResolvedValue(true);
      mockDomainRepository.findByDomainName.mockResolvedValue(mockData.domain);
      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
        mockData.companyDomain
      );
      mockUserRoleRepository.findUserRoleByUserIdAndCompanyId.mockResolvedValue(
        mockData.userRole
      );
      mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
        mockData.permissions
      );
      mockUserRepository.updateUserLastLogin.mockResolvedValue(undefined);

      const { token, user } = await authService.login(
        'test@example.com',
        'password123',
        req
      );

      expect(token).toBe('mock_jwt_token');
      expect(user).toEqual({
        id: mockData.user.id,
        email: mockData.user.email,
        firstName: mockData.user.firstName,
        lastName: mockData.user.lastName,
      });
    });

    it('should update last login with correct data', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
      mockPasswordService.verify.mockResolvedValue(true);
      mockDomainRepository.findByDomainName.mockResolvedValue(mockData.domain);
      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
        mockData.companyDomain
      );
      mockUserRoleRepository.findUserRoleByUserIdAndCompanyId.mockResolvedValue(
        mockData.userRole
      );
      mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
        mockData.permissions
      );
      mockUserRepository.updateUserLastLogin.mockResolvedValue(undefined);

      await authService.login('test@example.com', 'password123', req);

      expect(mockUserRepository.updateUserLastLogin).toHaveBeenCalledWith(
        mockData.user.id,
        '127.0.0.1'
      );
    });

    it('should login user even with no permissions', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
      mockPasswordService.verify.mockResolvedValue(true);
      mockDomainRepository.findByDomainName.mockResolvedValue(mockData.domain);
      mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
        mockData.companyDomain
      );
      mockUserRoleRepository.findUserRoleByUserIdAndCompanyId.mockResolvedValue(
        mockData.userRole
      );
      mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
        []
      );
      mockUserRepository.updateUserLastLogin.mockResolvedValue(undefined);

      const { token } = await authService.login(
        'test@example.com',
        'password123',
        req
      );

      expect(token).toBe('mock_jwt_token');
      expect(mockTokenService.generateToken).toHaveBeenCalledWith(
        expect.objectContaining({ permissions: [] })
      );
    });

    it('should not call domain or company DB methods if password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
      mockPasswordService.verify.mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrong-password', req)
      ).rejects.toThrow(InvalidCredentialsError);

      expect(mockDomainRepository.findByDomainName).not.toHaveBeenCalled();
      expect(
        mockCompanyDomainRepository.findByDomainIdWithCompany
      ).not.toHaveBeenCalled();
      expect(
        mockUserRoleRepository.findUserRoleByUserIdAndCompanyId
      ).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });

    describe.each([
      {
        description: 'unauthorized or inactive domain',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
          mockPasswordService.verify.mockResolvedValue(true);
          mockDomainRepository.findByDomainName.mockResolvedValue(null);
        },
        errorClass: UserNotFoundError,
      },
      {
        description: 'domain not associated with active company',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
          mockPasswordService.verify.mockResolvedValue(true);
          mockDomainRepository.findByDomainName.mockResolvedValue(
            mockData.domain
          );
          mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
            null
          );
        },
        errorClass: CompanyNotFoundError,
      },
      {
        description: 'inactive company',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
          mockPasswordService.verify.mockResolvedValue(true);
          mockDomainRepository.findByDomainName.mockResolvedValue(
            mockData.domain
          );
          mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
            {
              ...mockData.companyDomain,
              company: { isActive: false },
            }
          );
        },
        errorClass: CompanyNotFoundError,
      },
      {
        description: 'user not found',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue(null);
        },
        errorClass: UserNotFoundError,
      },
      {
        description: 'inactive user',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue({
            ...mockData.user,
            isActive: false,
          });
        },
        errorClass: UserNotActiveError,
      },
      {
        description: 'invalid password',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
          mockPasswordService.verify.mockResolvedValue(false);
        },
        errorClass: InvalidCredentialsError,
      },
      {
        description: 'user has no role in this company',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
          mockPasswordService.verify.mockResolvedValue(true);
          mockDomainRepository.findByDomainName.mockResolvedValue(
            mockData.domain
          );
          mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
            mockData.companyDomain
          );
          mockUserRoleRepository.findUserRoleByUserIdAndCompanyId.mockResolvedValue(
            null
          );
        },
        errorClass: NoRoleInCompanyError,
      },
      {
        description: 'inactive domain',
        setup: () => {
          mockUserRepository.findByEmail.mockResolvedValue(mockData.user);
          mockPasswordService.verify.mockResolvedValue(true);
          mockDomainRepository.findByDomainName.mockResolvedValue({
            ...mockData.domain,
            isActive: false,
          });
        },
        errorClass: DomainNotActiveError,
      },
    ])('should throw an error for $description', ({ setup, errorClass }) => {
      it(`→ throws ${errorClass.name}`, async () => {
        setup();
        await expect(
          authService.login('test@example.com', 'password123', req)
        ).rejects.toThrow(errorClass);
      });
    });
  });

  describe('logout', () => {
    it('should invalidate the token successfully', async () => {
      const token = 'some_token';
      mockTokenService.invalidateToken.mockResolvedValue(undefined); // Mock the return value
      await authService.logout(token);
      expect(mockTokenService.invalidateToken).toHaveBeenCalledWith(token);
    });
  });
});
