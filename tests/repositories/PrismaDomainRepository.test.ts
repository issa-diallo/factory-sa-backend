import { PrismaDomainRepository } from '../../src/repositories/domain/PrismaDomainRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { Domain } from '../../src/generated/prisma';
import { Prisma } from '../../src/generated/prisma';

type MockedPrismaMethod<T> = jest.Mock<Promise<T>, [unknown]>;

const mockPrisma: IPrismaService = {
  domain: {
    findUnique: jest.fn() as MockedPrismaMethod<Domain | null>,
    findFirst: jest.fn() as MockedPrismaMethod<Domain | null>,
    findMany: jest.fn() as MockedPrismaMethod<Domain[]>,
    create: jest.fn() as MockedPrismaMethod<Domain>,
    update: jest.fn() as MockedPrismaMethod<Domain>,
    delete: jest.fn() as MockedPrismaMethod<Domain>,
  },
} as unknown as IPrismaService;

describe('PrismaDomainRepository', () => {
  let repository: PrismaDomainRepository;

  beforeEach(() => {
    repository = new PrismaDomainRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should find domain by id', async () => {
    const expected = { id: '1', name: 'example.com' } as Domain;
    (mockPrisma.domain.findUnique as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findById('1');

    expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });

  it('should find domain by name', async () => {
    const expected = { id: '1', name: 'example.com' } as Domain;
    (mockPrisma.domain.findFirst as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findByDomainName('example.com');

    expect(mockPrisma.domain.findFirst).toHaveBeenCalledWith({
      where: { name: 'example.com' },
    });
    expect(result).toEqual(expected);
  });

  it('should create a domain', async () => {
    const data: Prisma.DomainCreateInput = {
      name: 'new.com',
    } as Prisma.DomainCreateInput;
    const expected = { id: '2', name: 'new.com' } as Domain;
    (mockPrisma.domain.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.create(data);

    expect(mockPrisma.domain.create).toHaveBeenCalledWith({ data });
    expect(result).toEqual(expected);
  });

  it('should update a domain', async () => {
    const data: Prisma.DomainUpdateInput = { name: 'updated.com' };
    const expected = { id: '1', name: 'updated.com' } as Domain;
    (mockPrisma.domain.update as jest.Mock).mockResolvedValue(expected);

    const result = await repository.update('1', data);

    expect(mockPrisma.domain.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data,
    });
    expect(result).toEqual(expected);
  });

  it('should delete a domain', async () => {
    const expected = { id: '1', name: 'to-delete.com' } as Domain;
    (mockPrisma.domain.delete as jest.Mock).mockResolvedValue(expected);

    const result = await repository.delete('1');

    expect(mockPrisma.domain.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });

  it('should return all domains', async () => {
    const expected = [
      { id: '1', name: 'a.com' },
      { id: '2', name: 'b.com' },
    ] as Domain[];
    (mockPrisma.domain.findMany as jest.Mock).mockResolvedValue(expected);

    const result = await repository.findAll();

    expect(mockPrisma.domain.findMany).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });
});
