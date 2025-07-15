import { AuthService } from '../../../src/services/auth/authService';
import { PrismaClient } from '../../../src/generated/prisma';
import {
  IPasswordService,
  ITokenService,
} from '../../../src/services/auth/interfaces';
import { Request } from 'express';
import { getClientIp } from '../../../src/utils/getClientIp';

// Mock PrismaClient
jest.mock('../../../src/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    domain: {
      findFirst: jest.fn(),
    },
    companyDomain: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userRole: {
      findFirst: jest.fn(),
    },
    rolePermission: {
      findMany: jest.fn(),
    },
  })),
}));

// Mock PasswordService
const mockPasswordService: jest.Mocked<IPasswordService> = {
  hash: jest.fn(),
  verify: jest.fn(),
};

// Mock TokenService
const mockTokenService: jest.Mocked<ITokenService> = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  invalidateToken: jest.fn(),
};

// Mock getClientIp
jest.mock('../../../src/utils/getClientIp', () => ({
  getClientIp: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaClient;
  let req: Request;

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
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      password: 'hashedpassword',
      isActive: true,
      firstName: 'Test',
      lastName: 'User',
    };
    const mockDomain = { id: 'domain1', name: 'example.com', isActive: true };
    const mockCompanyDomain = {
      domainId: 'domain1',
      companyId: 'company1',
      company: { isActive: true },
    };
    const mockUserRole = {
      userId: 'user1',
      roleId: 'role1',
      companyId: 'company1',
      role: { name: 'Admin' },
    };
    const mockPermissions = [
      { permission: { name: 'read' } },
      { permission: { name: 'write' } },
    ];
    const mockToken = 'mock_jwt_token';

    beforeEach(() => {
      (prisma.domain.findFirst as jest.Mock).mockResolvedValue(mockDomain);
      (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(
        mockCompanyDomain
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (prisma.userRole.findFirst as jest.Mock).mockResolvedValue(mockUserRole);
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue(
        mockPermissions
      );
      (mockTokenService.generateToken as jest.Mock).mockResolvedValue(
        mockToken
      );
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (getClientIp as jest.Mock).mockReturnValue('127.0.0.1');
    });

    it('should successfully log in a user and return token and user info', async () => {
      const { token, user } = await authService.login(
        'test@example.com',
        'password123',
        req
      );

      expect(prisma.domain.findFirst).toHaveBeenCalledWith({
        where: { name: 'example.com', isActive: true },
      });
      expect(prisma.companyDomain.findFirst).toHaveBeenCalledWith({
        where: { domainId: mockDomain.id },
        include: { company: true },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        'password123',
        mockUser.password
      );
      expect(prisma.userRole.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUser.id, companyId: mockCompanyDomain.companyId },
        include: { role: true },
      });
      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { roleId: mockUserRole.roleId },
        include: { permission: true },
      });
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        companyId: mockCompanyDomain.companyId,
        roleId: mockUserRole.roleId,
        permissions: ['read', 'write'],
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          lastLoginAt: expect.any(Date),
          lastLoginIp: '127.0.0.1',
        },
      });
      expect(token).toBe(mockToken);
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
    });

    it('should throw an error for unauthorized or inactive domain', async () => {
      (prisma.domain.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login('test@example.com', 'password123', req)
      ).rejects.toThrow('Unauthorized or inactive domain');
    });

    it('should throw an error if domain not associated with active company', async () => {
      (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login('test@example.com', 'password123', req)
      ).rejects.toThrow('Domain not associated with an active company');
    });

    it('should throw an error for inactive company', async () => {
      (prisma.companyDomain.findFirst as jest.Mock).mockResolvedValue({
        ...mockCompanyDomain,
        company: { isActive: false },
      });
      await expect(
        authService.login('test@example.com', 'password123', req)
      ).rejects.toThrow('Domain not associated with an active company');
    });

    it('should throw an error for invalid credentials or inactive user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login('test@example.com', 'password123', req)
      ).rejects.toThrow('Invalid credentials or inactive user');
    });

    it('should throw an error for inactive user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });
      await expect(
        authService.login('test@example.com', 'password123', req)
      ).rejects.toThrow('Invalid credentials or inactive user');
    });

    it('should throw an error for invalid password', async () => {
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(false);
      await expect(
        authService.login('test@example.com', 'password123', req)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error if user has no role in this company', async () => {
      (prisma.userRole.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login('test@example.com', 'password123', req)
      ).rejects.toThrow('User has no role in this company');
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
