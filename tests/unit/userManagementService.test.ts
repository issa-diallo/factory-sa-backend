import { UserManagementService } from '../../src/services/userManagement/userManagementService';
import { PrismaClient } from '../../src/generated/prisma';
import { IPasswordService } from '../../src/services/auth/interfaces';
import { normalizeEmail } from '../../src/utils/normalizeEmail';

// Mock de PrismaClient
jest.mock('../../src/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock de IPasswordService
const mockPasswordService = {
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  verify: jest.fn(),
} as jest.Mocked<IPasswordService>;

// Mock de normalizeEmail
jest.mock('../../src/utils/normalizeEmail', () => ({
  normalizeEmail: jest.fn((email: string) => email.toLowerCase()),
}));

describe('UserManagementService', () => {
  let userManagementService: UserManagementService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    userManagementService = new UserManagementService(
      prisma,
      mockPasswordService
    );
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastLoginAt: null,
        lastLoginIp: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userManagementService.createUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('password123');
      expect(normalizeEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastLoginAt: null,
        lastLoginIp: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userManagementService.getUserById('1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it("devrait retourner null si l'utilisateur n'est pas trouvé par ID", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userManagementService.getUserById('99');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '99' },
        select: expect.any(Object),
      });
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('devrait retourner un utilisateur par email', async () => {
      const mockUser = {
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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result =
        await userManagementService.getUserByEmail('TEST@EXAMPLE.COM');

      expect(normalizeEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it("devrait retourner null si l'utilisateur n'est pas trouvé par email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userManagementService.getUserByEmail(
        'nonexistent@example.com'
      );

      expect(normalizeEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test1@example.com',
          firstName: 'Test1',
          lastName: 'User1',
          isActive: true,
          lastLoginAt: null,
          lastLoginIp: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'test2@example.com',
          firstName: 'Test2',
          lastName: 'User2',
          isActive: true,
          lastLoginAt: null,
          lastLoginIp: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userManagementService.getAllUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUsers);
    });

    it("devrait retourner un tableau vide s'il n'y a pas d'utilisateurs", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await userManagementService.getAllUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur existant', async () => {
      const updatedUser = {
        id: '1',
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        isActive: true,
        lastLoginAt: null,
        lastLoginIp: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userManagementService.updateUser('1', {
        email: 'UPDATED@EXAMPLE.COM',
        firstName: 'Updated',
      });

      expect(normalizeEmail).toHaveBeenCalledWith('UPDATED@EXAMPLE.COM');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { email: 'updated@example.com', firstName: 'Updated' },
        select: expect.any(Object),
      });
      expect(result).toEqual(updatedUser);
    });

    it('devrait mettre à jour le mot de passe si fourni', async () => {
      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastLoginAt: null,
        lastLoginIp: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userManagementService.updateUser('1', {
        password: 'newPassword123',
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('newPassword123');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashedPassword' },
        select: expect.any(Object),
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('devrait supprimer un utilisateur existant', async () => {
      const deletedUser = {
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
      (prisma.user.delete as jest.Mock).mockResolvedValue(deletedUser);

      const result = await userManagementService.deleteUser('1');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(deletedUser);
    });
  });

  describe('createUserRole', () => {
    it('devrait créer une nouvelle association utilisateur-rôle', async () => {
      const mockUserRole = {
        id: 'ur1',
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
      };
      (prisma.userRole.create as jest.Mock).mockResolvedValue(mockUserRole);

      const result = await userManagementService.createUserRole({
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
      });

      expect(prisma.userRole.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          companyId: 'company1',
          roleId: 'role1',
        },
      });
      expect(result).toEqual(mockUserRole);
    });
  });

  describe('getUserRoleById', () => {
    it('devrait retourner une association utilisateur-rôle par ID', async () => {
      const mockUserRole = {
        id: 'ur1',
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
      };
      (prisma.userRole.findUnique as jest.Mock).mockResolvedValue(mockUserRole);

      const result = await userManagementService.getUserRoleById('ur1');

      expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
        where: { id: 'ur1' },
      });
      expect(result).toEqual(mockUserRole);
    });

    it("devrait retourner null si l'association utilisateur-rôle n'est pas trouvée par ID", async () => {
      (prisma.userRole.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userManagementService.getUserRoleById('ur99');

      expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
        where: { id: 'ur99' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getUserRolesByUserId', () => {
    it('devrait retourner les associations utilisateur-rôle par ID utilisateur', async () => {
      const mockUserRoles = [
        {
          id: 'ur1',
          userId: 'user1',
          companyId: 'company1',
          roleId: 'role1',
          role: { id: 'role1', name: 'Admin', description: 'Admin Role' },
          company: { id: 'company1', name: 'Company A', isActive: true },
        },
      ];
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);

      const result = await userManagementService.getUserRolesByUserId('user1');

      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          role: true,
          company: true,
        },
      });
      expect(result).toEqual(mockUserRoles);
    });

    it("devrait retourner un tableau vide si aucune association n'est trouvée pour l'ID utilisateur", async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);

      const result = await userManagementService.getUserRolesByUserId('user99');

      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { userId: 'user99' },
        include: {
          role: true,
          company: true,
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getUserRolesByCompanyId', () => {
    it('devrait retourner les associations utilisateur-rôle par ID de compagnie', async () => {
      const mockUserRoles = [
        {
          id: 'ur1',
          userId: 'user1',
          companyId: 'company1',
          roleId: 'role1',
        },
      ];
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);

      const result =
        await userManagementService.getUserRolesByCompanyId('company1');

      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company1' },
      });
      expect(result).toEqual(mockUserRoles);
    });

    it("devrait retourner un tableau vide si aucune association n'est trouvée pour l'ID de compagnie", async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);

      const result =
        await userManagementService.getUserRolesByCompanyId('company99');

      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company99' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getUserRolesByRoleId', () => {
    it('devrait retourner les associations utilisateur-rôle par ID de rôle', async () => {
      const mockUserRoles = [
        {
          id: 'ur1',
          userId: 'user1',
          companyId: 'company1',
          roleId: 'role1',
        },
      ];
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);

      const result = await userManagementService.getUserRolesByRoleId('role1');

      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { roleId: 'role1' },
      });
      expect(result).toEqual(mockUserRoles);
    });

    it("devrait retourner un tableau vide si aucune association n'est trouvée pour l'ID de rôle", async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);

      const result = await userManagementService.getUserRolesByRoleId('role99');

      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { roleId: 'role99' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('deleteUserRole', () => {
    it('devrait supprimer une association utilisateur-rôle existante', async () => {
      const deletedUserRole = {
        id: 'ur1',
        userId: 'user1',
        companyId: 'company1',
        roleId: 'role1',
      };
      (prisma.userRole.delete as jest.Mock).mockResolvedValue(deletedUserRole);

      const result = await userManagementService.deleteUserRole('ur1');

      expect(prisma.userRole.delete).toHaveBeenCalledWith({
        where: { id: 'ur1' },
      });
      expect(result).toEqual(deletedUserRole);
    });
  });
});
