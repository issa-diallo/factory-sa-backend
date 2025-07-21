import { RoleService } from '../../src/services/role/roleService';
import { PrismaClient } from '../../src/generated/prisma';

// Mock de PrismaClient
jest.mock('../../src/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    role: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('RoleService', () => {
  let roleService: RoleService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    roleService = new RoleService(prisma);
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('devrait créer un nouveau rôle', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrateur',
      };
      (prisma.role.create as jest.Mock).mockResolvedValue(mockRole);

      const result = await roleService.createRole({
        name: 'Admin',
        description: 'Administrateur',
      });

      expect(prisma.role.create).toHaveBeenCalledWith({
        data: {
          name: 'Admin',
          description: 'Administrateur',
        },
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('getRoleById', () => {
    it('devrait retourner un rôle par ID', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrateur',
      };
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      const result = await roleService.getRoleById('1');

      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockRole);
    });

    it("devrait retourner null si le rôle n'est pas trouvé par ID", async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await roleService.getRoleById('99');

      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: '99' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getRoleByName', () => {
    it('devrait retourner un rôle par nom', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrateur',
      };
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      const result = await roleService.getRoleByName('Admin');

      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'Admin' },
      });
      expect(result).toEqual(mockRole);
    });

    it("devrait retourner null si le rôle n'est pas trouvé par nom", async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await roleService.getRoleByName('NonExistentRole');

      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'NonExistentRole' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getAllRoles', () => {
    it('devrait retourner tous les rôles', async () => {
      const mockRoles = [
        { id: '1', name: 'Admin', description: 'Administrateur' },
        { id: '2', name: 'User', description: 'Utilisateur standard' },
      ];
      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await roleService.getAllRoles();

      expect(prisma.role.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockRoles);
    });

    it("devrait retourner un tableau vide s'il n'y a pas de rôles", async () => {
      (prisma.role.findMany as jest.Mock).mockResolvedValue([]);

      const result = await roleService.getAllRoles();

      expect(prisma.role.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('updateRole', () => {
    it('devrait mettre à jour un rôle existant', async () => {
      const updatedRole = {
        id: '1',
        name: 'SuperAdmin',
        description: 'Super Administrateur',
      };
      (prisma.role.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await roleService.updateRole('1', { name: 'SuperAdmin' });

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'SuperAdmin' },
      });
      expect(result).toEqual(updatedRole);
    });
  });

  describe('deleteRole', () => {
    it('devrait supprimer un rôle existant', async () => {
      const deletedRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrateur',
      };
      (prisma.role.delete as jest.Mock).mockResolvedValue(deletedRole);

      const result = await roleService.deleteRole('1');

      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(deletedRole);
    });
  });
});
