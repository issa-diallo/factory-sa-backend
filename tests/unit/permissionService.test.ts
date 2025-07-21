import { PermissionService } from '../../src/services/permission/permissionService';
import { PrismaClient } from '../../src/generated/prisma';

// Mock de PrismaClient
jest.mock('../../src/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    permission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    rolePermission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('PermissionService', () => {
  let permissionService: PermissionService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    permissionService = new PermissionService(prisma);
    jest.clearAllMocks();
  });

  describe('createPermission', () => {
    it('devrait créer une nouvelle permission', async () => {
      const mockPermission = {
        id: '1',
        name: 'test.permission',
        description: 'Test Description',
      };
      (prisma.permission.create as jest.Mock).mockResolvedValue(mockPermission);

      const result = await permissionService.createPermission({
        name: 'test.permission',
        description: 'Test Description',
      });

      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: {
          name: 'test.permission',
          description: 'Test Description',
        },
      });
      expect(result).toEqual(mockPermission);
    });
  });

  describe('getPermissionById', () => {
    it('devrait retourner une permission par ID', async () => {
      const mockPermission = {
        id: '1',
        name: 'test.permission',
        description: 'Test Description',
      };
      (prisma.permission.findUnique as jest.Mock).mockResolvedValue(
        mockPermission
      );

      const result = await permissionService.getPermissionById('1');

      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockPermission);
    });

    it("devrait retourner null si la permission n'est pas trouvée par ID", async () => {
      (prisma.permission.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await permissionService.getPermissionById('99');

      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { id: '99' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getPermissionByName', () => {
    it('devrait retourner une permission par nom', async () => {
      const mockPermission = {
        id: '1',
        name: 'test.permission',
        description: 'Test Description',
      };
      (prisma.permission.findUnique as jest.Mock).mockResolvedValue(
        mockPermission
      );

      const result =
        await permissionService.getPermissionByName('test.permission');

      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { name: 'test.permission' },
      });
      expect(result).toEqual(mockPermission);
    });

    it("devrait retourner null si la permission n'est pas trouvée par nom", async () => {
      (prisma.permission.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await permissionService.getPermissionByName(
        'non.existent.permission'
      );

      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { name: 'non.existent.permission' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getAllPermissions', () => {
    it('devrait retourner toutes les permissions', async () => {
      const mockPermissions = [
        { id: '1', name: 'test.permission1', description: 'Desc 1' },
        { id: '2', name: 'test.permission2', description: 'Desc 2' },
      ];
      (prisma.permission.findMany as jest.Mock).mockResolvedValue(
        mockPermissions
      );

      const result = await permissionService.getAllPermissions();

      expect(prisma.permission.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockPermissions);
    });

    it("devrait retourner un tableau vide s'il n'y a pas de permissions", async () => {
      (prisma.permission.findMany as jest.Mock).mockResolvedValue([]);

      const result = await permissionService.getAllPermissions();

      expect(prisma.permission.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('updatePermission', () => {
    it('devrait mettre à jour une permission existante', async () => {
      const updatedPermission = {
        id: '1',
        name: 'updated.permission',
        description: 'Updated Description',
      };
      (prisma.permission.update as jest.Mock).mockResolvedValue(
        updatedPermission
      );

      const result = await permissionService.updatePermission('1', {
        name: 'updated.permission',
      });

      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'updated.permission' },
      });
      expect(result).toEqual(updatedPermission);
    });
  });

  describe('deletePermission', () => {
    it('devrait supprimer une permission existante', async () => {
      const deletedPermission = {
        id: '1',
        name: 'test.permission',
        description: 'Test Description',
      };
      (prisma.permission.delete as jest.Mock).mockResolvedValue(
        deletedPermission
      );

      const result = await permissionService.deletePermission('1');

      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(deletedPermission);
    });
  });

  describe('createRolePermission', () => {
    it('devrait créer une nouvelle association rôle-permission', async () => {
      const mockRolePermission = {
        id: 'rp1',
        roleId: 'role1',
        permissionId: 'perm1',
      };
      (prisma.rolePermission.create as jest.Mock).mockResolvedValue(
        mockRolePermission
      );

      const result = await permissionService.createRolePermission({
        roleId: 'role1',
        permissionId: 'perm1',
      });

      expect(prisma.rolePermission.create).toHaveBeenCalledWith({
        data: {
          roleId: 'role1',
          permissionId: 'perm1',
        },
      });
      expect(result).toEqual(mockRolePermission);
    });
  });

  describe('getRolePermissionById', () => {
    it('devrait retourner une association rôle-permission par ID', async () => {
      const mockRolePermission = {
        id: 'rp1',
        roleId: 'role1',
        permissionId: 'perm1',
      };
      (prisma.rolePermission.findUnique as jest.Mock).mockResolvedValue(
        mockRolePermission
      );

      const result = await permissionService.getRolePermissionById('rp1');

      expect(prisma.rolePermission.findUnique).toHaveBeenCalledWith({
        where: { id: 'rp1' },
      });
      expect(result).toEqual(mockRolePermission);
    });

    it("devrait retourner null si l'association rôle-permission n'est pas trouvée par ID", async () => {
      (prisma.rolePermission.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await permissionService.getRolePermissionById('rp99');

      expect(prisma.rolePermission.findUnique).toHaveBeenCalledWith({
        where: { id: 'rp99' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getRolePermissionsByRoleId', () => {
    it('devrait retourner les associations rôle-permission par ID de rôle', async () => {
      const mockRolePermissions = [
        { id: 'rp1', roleId: 'role1', permissionId: 'perm1' },
        { id: 'rp2', roleId: 'role1', permissionId: 'perm2' },
      ];
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue(
        mockRolePermissions
      );

      const result =
        await permissionService.getRolePermissionsByRoleId('role1');

      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { roleId: 'role1' },
      });
      expect(result).toEqual(mockRolePermissions);
    });

    it("devrait retourner un tableau vide si aucune association n'est trouvée pour l'ID de rôle", async () => {
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);

      const result =
        await permissionService.getRolePermissionsByRoleId('role99');

      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { roleId: 'role99' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getRolePermissionsByPermissionId', () => {
    it('devrait retourner les associations rôle-permission par ID de permission', async () => {
      const mockRolePermissions = [
        { id: 'rp1', roleId: 'role1', permissionId: 'perm1' },
        { id: 'rp3', roleId: 'role2', permissionId: 'perm1' },
      ];
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue(
        mockRolePermissions
      );

      const result =
        await permissionService.getRolePermissionsByPermissionId('perm1');

      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { permissionId: 'perm1' },
      });
      expect(result).toEqual(mockRolePermissions);
    });

    it("devrait retourner un tableau vide si aucune association n'est trouvée pour l'ID de permission", async () => {
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);

      const result =
        await permissionService.getRolePermissionsByPermissionId('perm99');

      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { permissionId: 'perm99' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('deleteRolePermission', () => {
    it('devrait supprimer une association rôle-permission existante', async () => {
      const deletedRolePermission = {
        id: 'rp1',
        roleId: 'role1',
        permissionId: 'perm1',
      };
      (prisma.rolePermission.delete as jest.Mock).mockResolvedValue(
        deletedRolePermission
      );

      const result = await permissionService.deleteRolePermission('rp1');

      expect(prisma.rolePermission.delete).toHaveBeenCalledWith({
        where: { id: 'rp1' },
      });
      expect(result).toEqual(deletedRolePermission);
    });
  });
});
