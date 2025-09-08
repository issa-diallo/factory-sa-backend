import { UserManagementService } from '../../src/services/userManagement/userManagementService';
import { IPasswordService } from '../../src/services/auth/interfaces';
import { IUserRepository } from '../../src/repositories/user/IUserRepository';
import { IUserRoleRepository } from '../../src/repositories/userRole/IUserRoleRepository';
import { normalizeEmail } from '../../src/utils/normalizeEmail';
import { User, UserRole } from '../../src/generated/prisma';

jest.mock('../../src/utils/normalizeEmail', () => ({
  normalizeEmail: jest.fn((email: string) => email.toLowerCase()),
}));

const mockPasswordService: jest.Mocked<IPasswordService> = {
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  verify: jest.fn(),
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateUserLastLogin: jest.fn(),
  findUsersByCompany: jest.fn(),
  isUserInCompany: jest.fn(),
  getUserCompanyId: jest.fn(),
};

const mockUserRoleRepository: jest.Mocked<IUserRoleRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByCompanyId: jest.fn(),
  findByRoleId: jest.fn(),
  delete: jest.fn(),
  findUserRoleByUserIdAndCompanyId: jest.fn(),
};

describe('UserManagementService', () => {
  let userManagementService: UserManagementService;

  beforeEach(() => {
    userManagementService = new UserManagementService(
      mockUserRepository,
      mockUserRoleRepository,
      mockPasswordService
    );
    jest.clearAllMocks();
  });

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    lastLoginAt: null,
    lastLoginIp: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createUser', () => {
    it('should create a new user with default isActive true', async () => {
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userManagementService.createUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roleId: 'role-user-id',
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('password123');
      expect(normalizeEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
      });
      expect(result).toEqual(mockUser);
    });

    it('should create a new user with isActive false', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.create.mockResolvedValue(inactiveUser);

      const result = await userManagementService.createUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roleId: 'role-user-id',
        isActive: false,
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('password123');
      expect(normalizeEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: false,
      });
      expect(result).toEqual(inactiveUser);
    });

    it('should create a new user with explicit isActive true', async () => {
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userManagementService.createUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roleId: 'role-user-id',
        isActive: true,
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('password123');
      expect(normalizeEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userManagementService.getUserById('1');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should return null if the user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userManagementService.getUserById('99');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result =
        await userManagementService.getUserByEmail('TEST@EXAMPLE.COM');

      expect(normalizeEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser]);

      const result = await userManagementService.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('updateUser', () => {
    it('should update a user with email only', async () => {
      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userManagementService.updateUser('1', {
        email: 'UPDATED@EXAMPLE.COM',
      });

      expect(normalizeEmail).toHaveBeenCalledWith('UPDATED@EXAMPLE.COM');
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should update a user with password', async () => {
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userManagementService.updateUser('1', {
        password: 'newPassword123',
        firstName: 'Updated',
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('newPassword123');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        password: 'hashedPassword',
        firstName: 'Updated',
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update a user without password', async () => {
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userManagementService.updateUser('1', {
        firstName: 'Updated',
      });

      expect(mockPasswordService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        firstName: 'Updated',
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockUserRepository.delete.mockResolvedValue(mockUser);

      const result = await userManagementService.deleteUser('1');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUserRole', () => {
    it('should create a user-role association', async () => {
      const mockUserRole: UserRole = {
        id: 'ur1',
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRoleRepository.create.mockResolvedValue(mockUserRole);

      const result = await userManagementService.createUserRole({
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
      });

      expect(mockUserRoleRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockUserRole);
    });
  });

  describe('getUserRoleById', () => {
    it('should return a user-role association', async () => {
      const userRole: UserRole = {
        id: 'ur1',
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRoleRepository.findById.mockResolvedValue(userRole);

      const result = await userManagementService.getUserRoleById('ur1');

      expect(mockUserRoleRepository.findById).toHaveBeenCalledWith('ur1');
      expect(result).toEqual(userRole);
    });
  });

  describe('getUserRolesByUserId', () => {
    it('should return user roles by user ID', async () => {
      const userRoles: UserRole[] = [
        {
          id: 'ur1',
          userId: 'user1',
          companyId: 'company1',
          roleId: 'role1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ur2',
          userId: 'user1',
          companyId: 'company2',
          roleId: 'role2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockUserRoleRepository.findByUserId.mockResolvedValue(userRoles);

      const result = await userManagementService.getUserRolesByUserId('user1');

      expect(mockUserRoleRepository.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual(userRoles);
    });
  });

  describe('getUserRolesByCompanyId', () => {
    it('should return user roles by company ID', async () => {
      const userRoles: UserRole[] = [
        {
          id: 'ur1',
          userId: 'user1',
          companyId: 'company1',
          roleId: 'role1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ur2',
          userId: 'user2',
          companyId: 'company1',
          roleId: 'role2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockUserRoleRepository.findByCompanyId.mockResolvedValue(userRoles);

      const result =
        await userManagementService.getUserRolesByCompanyId('company1');

      expect(mockUserRoleRepository.findByCompanyId).toHaveBeenCalledWith(
        'company1'
      );
      expect(result).toEqual(userRoles);
    });
  });

  describe('getUserRolesByRoleId', () => {
    it('should return user roles by role ID', async () => {
      const userRoles: UserRole[] = [
        {
          id: 'ur1',
          userId: 'user1',
          companyId: 'company1',
          roleId: 'role1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ur2',
          userId: 'user2',
          companyId: 'company2',
          roleId: 'role1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockUserRoleRepository.findByRoleId.mockResolvedValue(userRoles);

      const result = await userManagementService.getUserRolesByRoleId('role1');

      expect(mockUserRoleRepository.findByRoleId).toHaveBeenCalledWith('role1');
      expect(result).toEqual(userRoles);
    });
  });

  describe('deleteUserRole', () => {
    it('should delete a user role', async () => {
      const userRole: UserRole = {
        id: 'ur1',
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRoleRepository.delete.mockResolvedValue(userRole);

      const result = await userManagementService.deleteUserRole('ur1');

      expect(mockUserRoleRepository.delete).toHaveBeenCalledWith('ur1');
      expect(result).toEqual(userRole);
    });
  });
});
