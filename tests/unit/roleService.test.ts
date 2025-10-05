import { RoleService } from '../../src/services/role/roleService';
import { IRoleRepository } from '../../src/repositories/role/IRoleRepository';

describe('RoleService', () => {
  let roleService: RoleService;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;

  const now = new Date();

  beforeEach(() => {
    mockRoleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithPermissions: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findSystemRoles: jest.fn(),
      findCustomRolesByCompany: jest.fn(),
      findAllRolesForCompany: jest.fn(),
      isSystemRole: jest.fn(),
      findRoleWithCompanyValidation: jest.fn(),
    };

    roleService = new RoleService(mockRoleRepository);
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrator',
        createdAt: now,
        updatedAt: now,
      };
      mockRoleRepository.create.mockResolvedValue(mockRole);

      const result = await roleService.createRole({
        name: 'Admin',
        description: 'Administrator',
      });

      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'Admin',
        description: 'Administrator',
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('getRoleById', () => {
    it('should return a role by ID', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrator',
        createdAt: now,
        updatedAt: now,
      };
      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const result = await roleService.getRoleById('1');

      expect(mockRoleRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockRole);
    });

    it('should return null if role is not found by ID', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      const result = await roleService.getRoleById('99');

      expect(mockRoleRepository.findById).toHaveBeenCalledWith('99');
      expect(result).toBeNull();
    });
  });

  describe('getRoleByName', () => {
    it('should return a role by name', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrator',
        createdAt: now,
        updatedAt: now,
      };
      mockRoleRepository.findByName.mockResolvedValue(mockRole);

      const result = await roleService.getRoleByName('Admin');

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('Admin');
      expect(result).toEqual(mockRole);
    });

    it('should return null if role is not found by name', async () => {
      mockRoleRepository.findByName.mockResolvedValue(null);

      const result = await roleService.getRoleByName('NonExistentRole');

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(
        'NonExistentRole'
      );
      expect(result).toBeNull();
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        {
          id: '1',
          name: 'Admin',
          description: 'Administrator',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '2',
          name: 'User',
          description: 'Standard user',
          createdAt: now,
          updatedAt: now,
        },
      ];
      mockRoleRepository.findAll.mockResolvedValue(mockRoles);

      const result = await roleService.getAllRoles();

      expect(mockRoleRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });

    it('should return an empty array if there are no roles', async () => {
      mockRoleRepository.findAll.mockResolvedValue([]);

      const result = await roleService.getAllRoles();

      expect(mockRoleRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const updatedRole = {
        id: '1',
        name: 'SuperAdmin',
        description: 'Super Administrator',
        createdAt: now,
        updatedAt: now,
      };
      mockRoleRepository.update.mockResolvedValue(updatedRole);

      const result = await roleService.updateRole('1', { name: 'SuperAdmin' });

      expect(mockRoleRepository.update).toHaveBeenCalledWith('1', {
        name: 'SuperAdmin',
      });
      expect(result).toEqual(updatedRole);
    });
  });

  describe('getRoleByIdWithPermissions', () => {
    it('should return a role with permissions by ID', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrator',
        createdAt: now,
        updatedAt: now,
        permissions: [
          {
            id: 'perm-1',
            roleId: '1',
            permissionId: 'p1',
            createdAt: now,
            updatedAt: now,
            permission: {
              id: 'p1',
              name: 'admin:read',
              description: 'Can read admin data',
            },
          },
        ],
      };
      mockRoleRepository.findByIdWithPermissions.mockResolvedValue(mockRole);

      const result = await roleService.getRoleByIdWithPermissions('1');

      expect(mockRoleRepository.findByIdWithPermissions).toHaveBeenCalledWith(
        '1'
      );
      expect(result).toEqual(mockRole);
    });

    it('should return null if role is not found by ID', async () => {
      mockRoleRepository.findByIdWithPermissions.mockResolvedValue(null);

      const result = await roleService.getRoleByIdWithPermissions('99');

      expect(mockRoleRepository.findByIdWithPermissions).toHaveBeenCalledWith(
        '99'
      );
      expect(result).toBeNull();
    });
  });

  describe('deleteRole', () => {
    it('should delete an existing role', async () => {
      const deletedRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrator',
        createdAt: now,
        updatedAt: now,
      };
      mockRoleRepository.delete.mockResolvedValue(deletedRole);

      const result = await roleService.deleteRole('1');

      expect(mockRoleRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deletedRole);
    });
  });
});
