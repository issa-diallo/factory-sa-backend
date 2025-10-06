import { PermissionService } from '../../src/services/permission/permissionService';
import { IPermissionRepository } from '../../src/repositories/permission/IPermissionRepository';
import { IRolePermissionRepository } from '../../src/repositories/rolePermission/IRolePermissionRepository';

// Mock des dépôts
const mockPermissionRepository: jest.Mocked<IPermissionRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockRolePermissionRepository: jest.Mocked<IRolePermissionRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findRolePermissionsByRoleId: jest.fn(),
  delete: jest.fn(),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockRoleRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdWithPermissions: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  findAllRolesForCompany: jest.fn(),
  findRoleWithCompanyValidation: jest.fn(),
  findSystemRoles: jest.fn(),
  findCustomRolesByCompany: jest.fn(),
  isSystemRole: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PermissionService', () => {
  let permissionService: PermissionService;

  beforeEach(() => {
    jest.clearAllMocks();
    permissionService = new PermissionService(
      mockPermissionRepository,
      mockRolePermissionRepository,
      mockRoleRepository as any
    );
  });

  describe('createPermission', () => {
    it('devrait créer une nouvelle permission', async () => {
      const mockPermission = {
        id: '1',
        name: 'test.permission',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionRepository.create.mockResolvedValue(mockPermission);

      const result = await permissionService.createPermission({
        name: 'test.permission',
        description: 'Test Description',
      });

      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: 'test.permission',
        description: 'Test Description',
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionRepository.findById.mockResolvedValue(mockPermission);

      const result = await permissionService.getPermissionById('1');

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockPermission);
    });

    it("devrait retourner null si la permission n'est pas trouvée par ID", async () => {
      mockPermissionRepository.findById.mockResolvedValue(null);

      const result = await permissionService.getPermissionById('99');

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('99');
      expect(result).toBeNull();
    });
  });

  describe('getPermissionByName', () => {
    it('devrait retourner une permission par nom', async () => {
      const mockPermission = {
        id: '1',
        name: 'test.permission',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionRepository.findByName.mockResolvedValue(mockPermission);

      const result =
        await permissionService.getPermissionByName('test.permission');

      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        'test.permission'
      );
      expect(result).toEqual(mockPermission);
    });

    it("devrait retourner null si la permission n'est pas trouvée par nom", async () => {
      mockPermissionRepository.findByName.mockResolvedValue(null);

      const result = await permissionService.getPermissionByName(
        'non.existent.permission'
      );

      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        'non.existent.permission'
      );
      expect(result).toBeNull();
    });
  });

  describe('getAllPermissions', () => {
    it('devrait retourner toutes les permissions', async () => {
      const mockPermissions = [
        {
          id: '1',
          name: 'test.permission1',
          description: 'Desc 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'test.permission2',
          description: 'Desc 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPermissionRepository.findAll.mockResolvedValue(mockPermissions);

      const result = await permissionService.getAllPermissions();

      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockPermissions);
    });

    it("devrait retourner un tableau vide s'il n'y a pas de permissions", async () => {
      mockPermissionRepository.findAll.mockResolvedValue([]);

      const result = await permissionService.getAllPermissions();

      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('updatePermission', () => {
    it('devrait mettre à jour une permission existante', async () => {
      const updatedPermission = {
        id: '1',
        name: 'updated.permission',
        description: 'Updated Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionRepository.update.mockResolvedValue(updatedPermission);

      const result = await permissionService.updatePermission('1', {
        name: 'updated.permission',
      });

      expect(mockPermissionRepository.update).toHaveBeenCalledWith('1', {
        name: 'updated.permission',
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionRepository.delete.mockResolvedValue(deletedPermission);

      const result = await permissionService.deletePermission('1');

      expect(mockPermissionRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deletedPermission);
    });
  });

  describe('createRolePermission', () => {
    it('devrait créer une nouvelle association rôle-permission', async () => {
      const mockRolePermission = {
        id: 'rp1',
        roleId: 'role1',
        permissionId: 'perm1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRolePermissionRepository.create.mockResolvedValue(mockRolePermission);

      const result = await permissionService.createRolePermission({
        roleId: 'role1',
        permissionId: 'perm1',
      });

      expect(mockRolePermissionRepository.create).toHaveBeenCalledWith({
        role: { connect: { id: 'role1' } },
        permission: { connect: { id: 'perm1' } },
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRolePermissionRepository.findById.mockResolvedValue(
        mockRolePermission
      );

      const result = await permissionService.getRolePermissionById('rp1');

      expect(mockRolePermissionRepository.findById).toHaveBeenCalledWith('rp1');
      expect(result).toEqual(mockRolePermission);
    });

    it("devrait retourner null si l'association rôle-permission n'est pas trouvée par ID", async () => {
      mockRolePermissionRepository.findById.mockResolvedValue(null);

      const result = await permissionService.getRolePermissionById('rp99');

      expect(mockRolePermissionRepository.findById).toHaveBeenCalledWith(
        'rp99'
      );
      expect(result).toBeNull();
    });
  });

  describe('getRolePermissionsByRoleId', () => {
    it('devrait retourner les associations rôle-permission par ID de rôle', async () => {
      const mockRolePermissions = [
        {
          id: 'rp1',
          roleId: 'role1',
          permissionId: 'perm1',
          createdAt: new Date(),
          updatedAt: new Date(),
          permission: { name: 'perm1_name' },
        },
        {
          id: 'rp2',
          roleId: 'role1',
          permissionId: 'perm2',
          createdAt: new Date(),
          updatedAt: new Date(),
          permission: { name: 'perm2_name' },
        },
      ];
      mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
        mockRolePermissions
      );

      const result =
        await permissionService.getRolePermissionsByRoleId('role1');

      expect(
        mockRolePermissionRepository.findRolePermissionsByRoleId
      ).toHaveBeenCalledWith('role1');
      expect(result).toEqual(mockRolePermissions);
    });

    it("devrait retourner un tableau vide si aucune association n'est trouvée pour l'ID de rôle", async () => {
      mockRolePermissionRepository.findRolePermissionsByRoleId.mockResolvedValue(
        []
      );

      const result =
        await permissionService.getRolePermissionsByRoleId('role99');

      expect(
        mockRolePermissionRepository.findRolePermissionsByRoleId
      ).toHaveBeenCalledWith('role99');
      expect(result).toEqual([]);
    });
  });

  describe('deleteRolePermission', () => {
    it('devrait supprimer une association rôle-permission existante', async () => {
      const deletedRolePermission = {
        id: 'rp1',
        roleId: 'role1',
        permissionId: 'perm1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRolePermissionRepository.delete.mockResolvedValue(
        deletedRolePermission
      );

      const result = await permissionService.deleteRolePermission('rp1');

      expect(mockRolePermissionRepository.delete).toHaveBeenCalledWith('rp1');
      expect(result).toEqual(deletedRolePermission);
    });
  });
});
