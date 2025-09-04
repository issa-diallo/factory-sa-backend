import { Request } from 'express';
import { AuthService } from '../../src/services/auth/authService';
import { IUserRepository } from '../../src/repositories/user/IUserRepository';
import { IDomainRepository } from '../../src/repositories/domain/IDomainRepository';
import { ICompanyDomainRepository } from '../../src/repositories/companyDomain/ICompanyDomainRepository';
import { IUserRoleRepository } from '../../src/repositories/userRole/IUserRoleRepository';
import { IRolePermissionRepository } from '../../src/repositories/rolePermission/IRolePermissionRepository';
import { IPasswordService } from '../../src/services/auth/interfaces';
import { ITokenService } from '../../src/services/auth/interfaces';
import {
  User,
  Domain,
  CompanyDomain,
  Company,
  UserRole,
  Role,
  RolePermission,
} from '../../src/generated/prisma';

describe('System Admin Detection', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockDomainRepository: jest.Mocked<IDomainRepository>;
  let mockCompanyDomainRepository: jest.Mocked<ICompanyDomainRepository>;
  let mockUserRoleRepository: jest.Mocked<IUserRoleRepository>;
  let mockRolePermissionRepository: jest.Mocked<IRolePermissionRepository>;
  let mockPasswordService: jest.Mocked<IPasswordService>;
  let mockTokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      updateUserLastLogin: jest.fn(),
    } as Partial<jest.Mocked<IUserRepository>> as jest.Mocked<IUserRepository>;

    mockDomainRepository = {
      findByDomainName: jest.fn(),
    } as Partial<
      jest.Mocked<IDomainRepository>
    > as jest.Mocked<IDomainRepository>;

    mockCompanyDomainRepository = {
      findByDomainIdWithCompany: jest.fn(),
    } as Partial<
      jest.Mocked<ICompanyDomainRepository>
    > as jest.Mocked<ICompanyDomainRepository>;

    mockUserRoleRepository = {
      findUserRoleByUserIdAndCompanyId: jest.fn(),
    } as Partial<
      jest.Mocked<IUserRoleRepository>
    > as jest.Mocked<IUserRoleRepository>;

    mockRolePermissionRepository = {
      findRolePermissionsByRoleId: jest.fn(),
    } as Partial<
      jest.Mocked<IRolePermissionRepository>
    > as jest.Mocked<IRolePermissionRepository>;

    mockPasswordService = {
      verify: jest.fn(),
    } as Partial<
      jest.Mocked<IPasswordService>
    > as jest.Mocked<IPasswordService>;

    mockTokenService = {
      generateToken: jest.fn(),
    } as Partial<jest.Mocked<ITokenService>> as jest.Mocked<ITokenService>;

    authService = new AuthService(
      mockUserRepository,
      mockDomainRepository,
      mockCompanyDomainRepository,
      mockUserRoleRepository,
      mockRolePermissionRepository,
      mockPasswordService,
      mockTokenService
    );
  });

  it('should detect ADMIN role as System Admin', async () => {
    // Mock data
    const mockUser: User = {
      id: 'user-1',
      email: 'admin@test.com',
      password: 'hashed-password',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      lastLoginAt: null,
      lastLoginIp: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDomain: Domain = {
      id: 'domain-1',
      name: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompany: Company = {
      id: 'company-1',
      name: 'Test Company',
      description: 'Test',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompanyDomain: CompanyDomain & { company: Company } = {
      id: 'cd-1',
      companyId: 'company-1',
      domainId: 'domain-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      company: mockCompany,
    };

    const mockRole: Role = {
      id: 'role-1',
      name: 'ADMIN',
      description: 'System Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUserRole: UserRole & { role: Role } = {
      id: 'ur-1',
      userId: 'user-1',
      companyId: 'company-1',
      roleId: 'role-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: mockRole,
    };

    const mockRolePermissions: (RolePermission & {
      permission: { name: string };
    })[] = [
      {
        id: 'rp-1',
        roleId: 'role-1',
        permissionId: 'perm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        permission: { name: 'company:read' },
      },
    ];

    // Setup mocks
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockPasswordService.verify.mockResolvedValue(true);
    mockDomainRepository.findByDomainName.mockResolvedValue(mockDomain);
    mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
      mockCompanyDomain
    );
    mockUserRoleRepository.findUserRoleByUserIdAndCompanyId.mockResolvedValue(
      mockUserRole
    );
    mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
      mockRolePermissions
    );
    mockTokenService.generateToken.mockResolvedValue('mock-token');

    const mockRequest = {
      ip: '127.0.0.1',
      headers: {},
    } as Request;

    // Execute
    await authService.login('admin@test.com', 'password', mockRequest);

    // Verify that generateToken was called with isSystemAdmin: true
    expect(mockTokenService.generateToken).toHaveBeenCalledWith({
      userId: 'user-1',
      companyId: 'company-1',
      roleId: 'role-1',
      roleName: 'ADMIN',
      permissions: ['company:read'],
      isSystemAdmin: true, // ✅ This should be true for ADMIN role
    });
  });

  it('should NOT detect USER role as System Admin', async () => {
    // Mock data with USER role
    const mockUser: User = {
      id: 'user-2',
      email: 'user@test.com',
      password: 'hashed-password',
      firstName: 'Regular',
      lastName: 'User',
      isActive: true,
      lastLoginAt: null,
      lastLoginIp: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDomain: Domain = {
      id: 'domain-1',
      name: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompany: Company = {
      id: 'company-1',
      name: 'Test Company',
      description: 'Test',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompanyDomain: CompanyDomain & { company: Company } = {
      id: 'cd-1',
      companyId: 'company-1',
      domainId: 'domain-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      company: mockCompany,
    };

    const mockRole: Role = {
      id: 'role-2',
      name: 'USER',
      description: 'Regular User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUserRole: UserRole & { role: Role } = {
      id: 'ur-2',
      userId: 'user-2',
      companyId: 'company-1',
      roleId: 'role-2',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: mockRole,
    };

    const mockRolePermissions: (RolePermission & {
      permission: { name: string };
    })[] = [
      {
        id: 'rp-2',
        roleId: 'role-2',
        permissionId: 'perm-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        permission: { name: 'packing_list:read' },
      },
    ];

    // Setup mocks
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockPasswordService.verify.mockResolvedValue(true);
    mockDomainRepository.findByDomainName.mockResolvedValue(mockDomain);
    mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
      mockCompanyDomain
    );
    mockUserRoleRepository.findUserRoleByUserIdAndCompanyId.mockResolvedValue(
      mockUserRole
    );
    mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
      mockRolePermissions
    );
    mockTokenService.generateToken.mockResolvedValue('mock-token');

    const mockRequest = {
      ip: '127.0.0.1',
      headers: {},
    } as Request;

    // Execute
    await authService.login('user@test.com', 'password', mockRequest);

    // Verify that generateToken was called with isSystemAdmin: false
    expect(mockTokenService.generateToken).toHaveBeenCalledWith({
      userId: 'user-2',
      companyId: 'company-1',
      roleId: 'role-2',
      roleName: 'USER',
      permissions: ['packing_list:read'],
      isSystemAdmin: false, // ✅ This should be false for USER role
    });
  });

  it('should detect MANAGER role as NOT System Admin', async () => {
    // Mock data with MANAGER role
    const mockUser: User = {
      id: 'user-3',
      email: 'manager@test.com',
      password: 'hashed-password',
      firstName: 'Manager',
      lastName: 'User',
      isActive: true,
      lastLoginAt: null,
      lastLoginIp: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDomain: Domain = {
      id: 'domain-1',
      name: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompany: Company = {
      id: 'company-1',
      name: 'Test Company',
      description: 'Test',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompanyDomain: CompanyDomain & { company: Company } = {
      id: 'cd-1',
      companyId: 'company-1',
      domainId: 'domain-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      company: mockCompany,
    };

    const mockRole: Role = {
      id: 'role-3',
      name: 'MANAGER',
      description: 'Company Manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUserRole: UserRole & { role: Role } = {
      id: 'ur-3',
      userId: 'user-3',
      companyId: 'company-1',
      roleId: 'role-3',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: mockRole,
    };

    const mockRolePermissions: (RolePermission & {
      permission: { name: string };
    })[] = [
      {
        id: 'rp-3',
        roleId: 'role-3',
        permissionId: 'perm-3',
        createdAt: new Date(),
        updatedAt: new Date(),
        permission: { name: 'user:manage' },
      },
    ];

    // Setup mocks
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockPasswordService.verify.mockResolvedValue(true);
    mockDomainRepository.findByDomainName.mockResolvedValue(mockDomain);
    mockCompanyDomainRepository.findByDomainIdWithCompany.mockResolvedValue(
      mockCompanyDomain
    );
    mockUserRoleRepository.findUserRoleByUserIdAndCompanyId.mockResolvedValue(
      mockUserRole
    );
    mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
      mockRolePermissions
    );
    mockTokenService.generateToken.mockResolvedValue('mock-token');

    const mockRequest = {
      ip: '127.0.0.1',
      headers: {},
    } as Request;

    // Execute
    await authService.login('manager@test.com', 'password', mockRequest);

    // Verify that generateToken was called with isSystemAdmin: false
    expect(mockTokenService.generateToken).toHaveBeenCalledWith({
      userId: 'user-3',
      companyId: 'company-1',
      roleId: 'role-3',
      roleName: 'MANAGER',
      permissions: ['user:manage'],
      isSystemAdmin: false, // ✅ This should be false for MANAGER role
    });
  });
});
