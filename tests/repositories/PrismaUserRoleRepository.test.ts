import { PrismaUserRoleRepository } from '../../src/repositories/userRole/PrismaUserRoleRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { Prisma, Role, UserRole } from '../../src/generated/prisma';

type UserRoleWithRole = UserRole & { role: Role };

const mockUserRole = {
  id: 'ur1',
  userId: 'u1',
  companyId: 'c1',
  roleId: 'r1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma: IPrismaService = {
  userRole: {
    findFirst: jest.fn() as jest.Mock<
      Promise<UserRoleWithRole | null>,
      [Prisma.UserRoleFindFirstArgs]
    >,
    create: jest.fn() as jest.Mock<
      Promise<UserRole>,
      [Prisma.UserRoleCreateArgs]
    >,
    findUnique: jest.fn() as jest.Mock<
      Promise<UserRole | null>,
      [Prisma.UserRoleFindUniqueArgs]
    >,
    findMany: jest.fn() as jest.Mock<
      Promise<UserRole[]>,
      [Prisma.UserRoleFindManyArgs]
    >,
    delete: jest.fn() as jest.Mock<
      Promise<UserRole>,
      [Prisma.UserRoleDeleteArgs]
    >,
  },
} as unknown as IPrismaService;

describe('PrismaUserRoleRepository', () => {
  let repository: PrismaUserRoleRepository;

  beforeEach(() => {
    repository = new PrismaUserRoleRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should find user role by userId and companyId', async () => {
    const expected = {
      ...mockUserRole,
      role: {
        id: 'r1',
        name: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    (mockPrisma.userRole.findFirst as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findUserRoleByUserIdAndCompanyId(
      'u1',
      'c1'
    );

    expect(mockPrisma.userRole.findFirst).toHaveBeenCalledWith({
      where: { userId: 'u1', companyId: 'c1' },
      include: { role: true },
    });
    expect(result).toEqual(expected);
  });

  it('should create a user role', async () => {
    (mockPrisma.userRole.create as jest.Mock).mockResolvedValue(mockUserRole);

    const result = await repository.create({} as Prisma.UserRoleCreateInput);
    expect(mockPrisma.userRole.create).toHaveBeenCalled();
    expect(result).toEqual(mockUserRole);
  });

  it('should find user role by id', async () => {
    (mockPrisma.userRole.findUnique as jest.Mock).mockResolvedValue(
      mockUserRole
    );

    const result = await repository.findById('ur1');
    expect(mockPrisma.userRole.findUnique).toHaveBeenCalledWith({
      where: { id: 'ur1' },
    });
    expect(result).toEqual(mockUserRole);
  });

  it('should find roles by userId', async () => {
    (mockPrisma.userRole.findMany as jest.Mock).mockResolvedValue([
      mockUserRole,
    ]);

    const result = await repository.findByUserId('u1');
    expect(mockPrisma.userRole.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      include: { role: true, company: true },
    });
    expect(result).toEqual([mockUserRole]);
  });

  it('should find roles by companyId', async () => {
    (mockPrisma.userRole.findMany as jest.Mock).mockResolvedValue([
      mockUserRole,
    ]);

    const result = await repository.findByCompanyId('c1');
    expect(mockPrisma.userRole.findMany).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
    });
    expect(result).toEqual([mockUserRole]);
  });

  it('should find roles by roleId', async () => {
    (mockPrisma.userRole.findMany as jest.Mock).mockResolvedValue([
      mockUserRole,
    ]);

    const result = await repository.findByRoleId('r1');
    expect(mockPrisma.userRole.findMany).toHaveBeenCalledWith({
      where: { roleId: 'r1' },
    });
    expect(result).toEqual([mockUserRole]);
  });

  it('should delete a user role', async () => {
    (mockPrisma.userRole.delete as jest.Mock).mockResolvedValue(mockUserRole);

    const result = await repository.delete('ur1');
    expect(mockPrisma.userRole.delete).toHaveBeenCalledWith({
      where: { id: 'ur1' },
    });
    expect(result).toEqual(mockUserRole);
  });
});
