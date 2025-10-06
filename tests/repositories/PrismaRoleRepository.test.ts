import { PrismaRoleRepository } from '../../src/repositories/role/PrismaRoleRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { Prisma, Role } from '../../src/generated/prisma';

type Mocked<T> = jest.Mock<Promise<T>, [unknown]>;

const mockPrisma: IPrismaService = {
  role: {
    create: jest.fn() as Mocked<Role>,
    findUnique: jest.fn() as Mocked<Role | null>,
    findMany: jest.fn() as Mocked<Role[]>,
    update: jest.fn() as Mocked<Role>,
    delete: jest.fn() as Mocked<Role>,
  },
  userRole: {
    findFirst: jest.fn() as Mocked<any>,
  },
} as unknown as IPrismaService;

describe('PrismaRoleRepository', () => {
  let repository: PrismaRoleRepository;

  beforeEach(() => {
    repository = new PrismaRoleRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should create a role', async () => {
    const input: Prisma.RoleCreateInput = { name: 'ADMIN' };
    const expected = { id: '1', name: 'ADMIN' } as Role;
    (mockPrisma.role.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.create(input);

    expect(mockPrisma.role.create).toHaveBeenCalledWith({ data: input });
    expect(result).toEqual(expected);
  });

  it('should find a role by ID', async () => {
    const expected = { id: '1', name: 'ADMIN' } as Role;
    (mockPrisma.role.findUnique as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findById('1');

    expect(mockPrisma.role.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });

  it('should find a role by name', async () => {
    const expected = { id: '1', name: 'ADMIN' } as Role;
    (mockPrisma.role.findUnique as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findByName('ADMIN');

    expect(mockPrisma.role.findUnique).toHaveBeenCalledWith({
      where: { name: 'ADMIN' },
    });
    expect(result).toEqual(expected);
  });

  it('should return all roles', async () => {
    const expected = [
      { id: '1', name: 'ADMIN' },
      { id: '2', name: 'MANAGER' },
    ] as Role[];
    (mockPrisma.role.findMany as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findAll();

    expect(mockPrisma.role.findMany).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('should update a role', async () => {
    const data: Prisma.RoleUpdateInput = { name: 'NEW_ROLE' };
    const expected = { id: '1', name: 'NEW_ROLE' } as Role;
    (mockPrisma.role.update as jest.Mock).mockResolvedValue(expected);

    const result = await repository.update('1', data);

    expect(mockPrisma.role.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data,
    });
    expect(result).toEqual(expected);
  });

  it('should delete a role', async () => {
    const expected = { id: '1', name: 'DELETED' } as Role;
    (mockPrisma.role.delete as jest.Mock).mockResolvedValue(expected);

    const result = await repository.delete('1');

    expect(mockPrisma.role.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(expected);
  });

  describe('findAvailableRolesForUser', () => {
    it('should return system roles when user has no role assignment', async () => {
      const systemRoles = [
        { id: '1', name: 'ADMIN', companyId: null },
        { id: '2', name: 'MANAGER', companyId: null },
        { id: '3', name: 'USER', companyId: null },
      ] as Role[];
      (mockPrisma.userRole.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.role.findMany as jest.Mock).mockResolvedValue(systemRoles);

      const result = await repository.findAvailableRolesForUser('user-1');

      expect(mockPrisma.userRole.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: { companyId: true },
      });

      expect(mockPrisma.role.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            in: ['ADMIN', 'MANAGER', 'USER'],
          },
        },
      });

      expect(result).toEqual(systemRoles);
    });

    it('should return system roles and company roles for user with company assignment', async () => {
      const expectedRoles = [
        { id: '1', name: 'ADMIN', companyId: null },
        { id: '2', name: 'MANAGER', companyId: null },
        { id: '3', name: 'USER', companyId: null },
        { id: '4', name: 'COMPANY_MANAGER', companyId: 'company-1' },
      ] as Role[];

      (mockPrisma.userRole.findFirst as jest.Mock).mockResolvedValue({
        companyId: 'company-1',
      });
      (mockPrisma.role.findMany as jest.Mock).mockResolvedValue(expectedRoles);

      const result = await repository.findAvailableRolesForUser('user-1');

      expect(mockPrisma.userRole.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: { companyId: true },
      });

      expect(mockPrisma.role.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ companyId: null }, { companyId: 'company-1' }],
        },
      });

      expect(result).toEqual(expectedRoles);
    });
  });
});
