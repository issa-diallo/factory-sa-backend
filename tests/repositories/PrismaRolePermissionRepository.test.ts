import { PrismaRolePermissionRepository } from '../../src/repositories/rolePermission/PrismaRolePermissionRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { Prisma, RolePermission } from '../../src/generated/prisma';

type RolePermissionWithPermission = RolePermission & {
  permission: { name: string };
};

const completeRolePermission = {
  id: '1',
  roleId: 'r1',
  permissionId: 'p1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma: IPrismaService = {
  rolePermission: {
    findMany: jest.fn() as jest.Mock<
      Promise<RolePermissionWithPermission[]>,
      [unknown]
    >,
    create: jest.fn() as jest.Mock<Promise<RolePermission>, [unknown]>,
    findUnique: jest.fn() as jest.Mock<
      Promise<RolePermission | null>,
      [unknown]
    >,
    delete: jest.fn() as jest.Mock<Promise<RolePermission>, [unknown]>,
  },
} as unknown as IPrismaService;

describe('PrismaRolePermissionRepository', () => {
  let repository: PrismaRolePermissionRepository;

  beforeEach(() => {
    repository = new PrismaRolePermissionRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should find role permissions by roleId', async () => {
    const expected: RolePermissionWithPermission[] = [
      {
        ...completeRolePermission,
        permission: { name: 'READ' },
      },
    ];
    (mockPrisma.rolePermission.findMany as jest.Mock).mockResolvedValue(
      expected
    );

    const result = await repository.findRolePermissionsByRoleId('r1');

    expect(mockPrisma.rolePermission.findMany).toHaveBeenCalledWith({
      where: { roleId: 'r1' },
      include: { permission: true },
    });
    expect(result).toEqual(expected);
  });

  it('should create a role permission', async () => {
    const data: Prisma.RolePermissionCreateInput = {
      role: { connect: { id: 'r1' } },
      permission: { connect: { id: 'p1' } },
    };
    const expected = completeRolePermission;
    (mockPrisma.rolePermission.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.create(data);

    expect(mockPrisma.rolePermission.create).toHaveBeenCalledWith({ data });
    expect(result).toEqual(expected);
  });

  it('should find a role permission by id', async () => {
    const expected = completeRolePermission;
    (mockPrisma.rolePermission.findUnique as jest.Mock).mockResolvedValue(
      expected
    );

    const result = await repository.findById('1');

    expect(mockPrisma.rolePermission.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });

  it('should delete a role permission by id', async () => {
    const expected = completeRolePermission;
    (mockPrisma.rolePermission.delete as jest.Mock).mockResolvedValue(expected);

    const result = await repository.delete('1');

    expect(mockPrisma.rolePermission.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });
});
