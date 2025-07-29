import { PrismaUserRepository } from '../../src/repositories/user/PrismaUserRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { Prisma, User } from '../../src/generated/prisma';

type MockedMethod<T> = jest.Mock<Promise<T>, [unknown]>;

const now = new Date();

const completeUser: User = {
  id: 'u1',
  email: 'admin@example.com',
  password: 'hashedpwd',
  firstName: 'Admin',
  lastName: 'User',
  isActive: true,
  createdAt: now,
  updatedAt: now,
  lastLoginAt: now,
  lastLoginIp: '127.0.0.1',
};

const mockPrisma: IPrismaService = {
  user: {
    findUnique: jest.fn() as MockedMethod<User | null>,
    create: jest.fn() as MockedMethod<User>,
    update: jest.fn() as MockedMethod<User>,
    delete: jest.fn() as MockedMethod<User>,
    findMany: jest.fn() as MockedMethod<User[]>,
  },
} as unknown as IPrismaService;

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;

  beforeEach(() => {
    repository = new PrismaUserRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should find user by ID', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(completeUser);
    const result = await repository.findById('u1');
    expect(result).toEqual(completeUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
    });
  });

  it('should find user by email', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(completeUser);
    const result = await repository.findByEmail('admin@example.com');
    expect(result).toEqual(completeUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });
  });

  it('should create a user', async () => {
    const data = { email: 'admin@example.com' } as Prisma.UserCreateInput;
    (mockPrisma.user.create as jest.Mock).mockResolvedValue(completeUser);
    const result = await repository.create(data);
    expect(result).toEqual(completeUser);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({ data });
  });

  it('should update a user', async () => {
    const data = { firstName: 'Updated' } as Prisma.UserUpdateInput;
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(completeUser);
    const result = await repository.update('u1', data);
    expect(result).toEqual(completeUser);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data,
    });
  });

  it('should delete a user', async () => {
    (mockPrisma.user.delete as jest.Mock).mockResolvedValue(completeUser);
    const result = await repository.delete('u1');
    expect(result).toEqual(completeUser);
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'u1' },
    });
  });

  it('should find all users', async () => {
    (mockPrisma.user.findMany as jest.Mock).mockResolvedValue([completeUser]);
    const result = await repository.findAll();
    expect(result).toEqual([completeUser]);
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  it('should update user last login', async () => {
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(completeUser);
    await repository.updateUserLastLogin('u1', '127.0.0.1');
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: {
        lastLoginAt: expect.any(Date),
        lastLoginIp: '127.0.0.1',
      },
    });
  });
});
