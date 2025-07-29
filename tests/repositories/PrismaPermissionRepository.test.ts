import { PrismaPermissionRepository } from '../../src/repositories/permission/PrismaPermissionRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { Permission, Prisma } from '../../src/generated/prisma';

type MockedPrismaMethod<T> = jest.Mock<Promise<T>, [unknown]>;

const mockPrisma: IPrismaService = {
  permission: {
    create: jest.fn() as MockedPrismaMethod<Permission>,
    findUnique: jest.fn() as MockedPrismaMethod<Permission | null>,
    findMany: jest.fn() as MockedPrismaMethod<Permission[]>,
    update: jest.fn() as MockedPrismaMethod<Permission>,
    delete: jest.fn() as MockedPrismaMethod<Permission>,
  },
} as unknown as IPrismaService;

describe('PrismaPermissionRepository', () => {
  let repository: PrismaPermissionRepository;

  beforeEach(() => {
    repository = new PrismaPermissionRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should create a permission', async () => {
    const input: Prisma.PermissionCreateInput = { name: 'user:create' };
    const expected = { id: '1', name: 'user:create' } as Permission;
    (mockPrisma.permission.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.create(input);

    expect(mockPrisma.permission.create).toHaveBeenCalledWith({ data: input });
    expect(result).toEqual(expected);
  });

  it('should find a permission by ID', async () => {
    const expected = { id: '1', name: 'user:create' } as Permission;
    (mockPrisma.permission.findUnique as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findById('1');

    expect(mockPrisma.permission.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });

  it('should find a permission by name', async () => {
    const expected = { id: '1', name: 'user:create' } as Permission;
    (mockPrisma.permission.findUnique as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findByName('user:create');

    expect(mockPrisma.permission.findUnique).toHaveBeenCalledWith({
      where: { name: 'user:create' },
    });
    expect(result).toEqual(expected);
  });

  it('should find all permissions', async () => {
    const expected = [
      { id: '1', name: 'user:create' },
      { id: '2', name: 'user:delete' },
    ] as Permission[];
    (mockPrisma.permission.findMany as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findAll();

    expect(mockPrisma.permission.findMany).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('should update a permission', async () => {
    const data: Prisma.PermissionUpdateInput = { name: 'user:update' };
    const expected = { id: '1', name: 'user:update' } as Permission;
    (mockPrisma.permission.update as jest.Mock).mockResolvedValue(expected);

    const result = await repository.update('1', data);

    expect(mockPrisma.permission.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data,
    });
    expect(result).toEqual(expected);
  });

  it('should delete a permission', async () => {
    const expected = { id: '1', name: 'user:delete' } as Permission;
    (mockPrisma.permission.delete as jest.Mock).mockResolvedValue(expected);

    const result = await repository.delete('1');

    expect(mockPrisma.permission.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });
});
