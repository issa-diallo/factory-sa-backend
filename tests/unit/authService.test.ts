import { AuthService } from '../../src/services/auth/authService';
import { PrismaClient } from '../../src/generated/prisma';
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
} from '../../src/errors/AuthErrors';

jest.mock('../../src/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    domain: { findFirst: jest.fn() },
    companyDomain: { findFirst: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    userRole: { findFirst: jest.fn() },
    rolePermission: { findMany: jest.fn() },
  })),
}));

const mockPasswordService = {
  hash: jest.fn(),
  verify: jest.fn().mockResolvedValue(true),
} as jest.Mocked<IPasswordService>;

const mockTokenService = {
  generateToken: jest.fn().mockResolvedValue('mock_jwt_token'),
  verifyToken: jest.fn(),
  invalidateToken: jest.fn(),
} as jest.Mocked<ITokenService>;

jest.mock('../../src/utils/getClientIp', () => ({
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaClient;
  let req: Request;

  const mockData = {
    user: {
      id: 'user1',
      email: 'test@example.com',
      password: 'hashedpassword',
      isActive: true,
      firstName: 'Test',
      lastName: 'User',
    },
    domain: { id: 'domain1', name: 'example.com', isActive: true },
    companyDomain: {
      domainId: 'domain1',
      companyId: 'company1',
      company: { isActive: true },
    },
    userRole: {
      userId: 'user1',
      roleId: 'role1',
      companyId: 'company1',
      role: { name: 'Admin' },
    },
    permissions: [
      { permission: { name: 'read' } },
      { permission: { name: 'write' } },
    ],
  };

  beforeEach(() => {
    prisma = new PrismaClient();
    authService = new AuthService(
      prisma,
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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockData.user);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (prisma.domain.findFirst as jest.Mock).mockResolvedValue(mockData.domain);
      (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(
        mockData.companyDomain
      );
      (prisma.userRole.findFirst as jest.Mock).mockResolvedValue(
        mockData.userRole
      );
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue(
        mockData.permissions
      );
      (prisma.user.update as jest.Mock).mockResolvedValue(mockData.user);

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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockData.user);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (prisma.domain.findFirst as jest.Mock).mockResolvedValue(mockData.domain);
      (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(
        mockData.companyDomain
      );
      (prisma.userRole.findFirst as jest.Mock).mockResolvedValue(
        mockData.userRole
      );
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue(
        mockData.permissions
      );
      (prisma.user.update as jest.Mock).mockResolvedValue(mockData.user);

      await authService.login('test@example.com', 'password123', req);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockData.user.id },
        data: {
          lastLoginAt: expect.any(Date),
          lastLoginIp: '127.0.0.1',
        },
      });
    });

    it('should login user even with no permissions', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockData.user);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (prisma.domain.findFirst as jest.Mock).mockResolvedValue(mockData.domain);
      (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(
        mockData.companyDomain
      );
      (prisma.userRole.findFirst as jest.Mock).mockResolvedValue(
        mockData.userRole
      );
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockData.user);

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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockData.user);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrong-password', req)
      ).rejects.toThrow(InvalidCredentialsError);

      expect(prisma.domain.findFirst).not.toHaveBeenCalled();
      expect(prisma.companyDomain.findFirst).not.toHaveBeenCalled();
      expect(prisma.userRole.findFirst).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });

    describe.each([
      {
        description: 'unauthorized or inactive domain',
        setup: () => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(
            mockData.user
          );
          (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
          (prisma.domain.findFirst as jest.Mock).mockResolvedValue(null);
        },
        errorClass: UserNotFoundError,
      },
      {
        description: 'domain not associated with active company',
        setup: () => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(
            mockData.user
          );
          (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
          (prisma.domain.findFirst as jest.Mock).mockResolvedValue(
            mockData.domain
          );
          (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(null);
        },
        errorClass: CompanyNotFoundError,
      },
      {
        description: 'inactive company',
        setup: () => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(
            mockData.user
          );
          (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
          (prisma.domain.findFirst as jest.Mock).mockResolvedValue(
            mockData.domain
          );
          (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue({
            ...mockData.companyDomain,
            company: { isActive: false },
          });
        },
        errorClass: CompanyNotFoundError,
      },
      {
        description: 'user not found',
        setup: () => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        },
        errorClass: UserNotFoundError,
      },
      {
        description: 'inactive user',
        setup: () => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            ...mockData.user,
            isActive: false,
          });
        },
        errorClass: UserNotActiveError,
      },
      {
        description: 'invalid password',
        setup: () => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(
            mockData.user
          );
          (mockPasswordService.verify as jest.Mock).mockResolvedValue(false);
        },
        errorClass: InvalidCredentialsError,
      },
      {
        description: 'user has no role in this company',
        setup: () => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(
            mockData.user
          );
          (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
          (prisma.domain.findFirst as jest.Mock).mockResolvedValue(
            mockData.domain
          );
          (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(
            mockData.companyDomain
          );
          (prisma.userRole.findFirst as jest.Mock).mockResolvedValue(null);
        },
        errorClass: NoRoleInCompanyError,
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
      await authService.logout(token);
      expect(mockTokenService.invalidateToken).toHaveBeenCalledWith(token);
    });
  });
});
