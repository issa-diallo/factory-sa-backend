import { PrismaCompanyDomainRepository } from '../../src/repositories/companyDomain/PrismaCompanyDomainRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { CompanyDomain, Prisma } from '../../src/generated/prisma';

type MockedPrismaMethod<T> = jest.Mock<Promise<T>, [unknown?]>;

const mockPrisma: IPrismaService = {
  companyDomain: {
    findFirst: jest.fn() as MockedPrismaMethod<
      | CompanyDomain
      | (CompanyDomain & { company: { isActive: boolean } })
      | null
    >,
    create: jest.fn() as MockedPrismaMethod<CompanyDomain>,
    delete: jest.fn() as MockedPrismaMethod<CompanyDomain>,
    findMany: jest.fn() as MockedPrismaMethod<CompanyDomain[]>,
    findUnique: jest.fn() as MockedPrismaMethod<CompanyDomain | null>,
  },
} as unknown as IPrismaService;

describe('PrismaCompanyDomainRepository', () => {
  let repository: PrismaCompanyDomainRepository;

  beforeEach(() => {
    repository = new PrismaCompanyDomainRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should find by domain ID', async () => {
    const expected = {
      id: '1',
      domainId: 'd1',
      companyId: 'c1',
    } as CompanyDomain;
    (mockPrisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(
      expected
    );

    const result = await repository.findByDomainId('d1');

    expect(mockPrisma.companyDomain.findFirst).toHaveBeenCalledWith({
      where: { domainId: 'd1' },
    });
    expect(result).toEqual(expected);
  });

  it('should find by domain ID with company', async () => {
    const expected = {
      id: '1',
      domainId: 'd1',
      companyId: 'c1',
      company: { isActive: true },
    };
    (mockPrisma.companyDomain.findFirst as jest.Mock).mockResolvedValue(
      expected
    );

    const result = await repository.findByDomainIdWithCompany('d1');

    expect(mockPrisma.companyDomain.findFirst).toHaveBeenCalledWith({
      where: { domainId: 'd1' },
      include: { company: true },
    });
    expect(result).toEqual(expected);
  });

  it('should create a company domain', async () => {
    const input = {
      company: { connect: { id: 'c1' } },
      domain: { connect: { id: 'd1' } },
    } as Prisma.CompanyDomainCreateInput;
    const expected = {
      id: '1',
      companyId: 'c1',
      domainId: 'd1',
    } as CompanyDomain;
    (mockPrisma.companyDomain.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.create(input);

    expect(mockPrisma.companyDomain.create).toHaveBeenCalledWith({
      data: input,
    });
    expect(result).toEqual(expected);
  });

  it('should delete a company domain', async () => {
    (mockPrisma.companyDomain.delete as jest.Mock).mockResolvedValue(
      {} as CompanyDomain
    );

    await repository.delete('c1', 'd1');

    expect(mockPrisma.companyDomain.delete).toHaveBeenCalledWith({
      where: {
        companyId_domainId: {
          companyId: 'c1',
          domainId: 'd1',
        },
      },
    });
  });

  it('should find by company ID', async () => {
    const expected = [
      { id: '1', companyId: 'c1', domainId: 'd1' },
    ] as CompanyDomain[];
    (mockPrisma.companyDomain.findMany as jest.Mock).mockResolvedValue(
      expected
    );

    const result = await repository.findByCompanyId('c1');

    expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
    });
    expect(result).toEqual(expected);
  });

  it('should find all by domain ID', async () => {
    const expected = [
      { id: '1', companyId: 'c1', domainId: 'd1' },
    ] as CompanyDomain[];
    (mockPrisma.companyDomain.findMany as jest.Mock).mockResolvedValue(
      expected
    );

    const result = await repository.findAllByDomainId('d1');

    expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
      where: { domainId: 'd1' },
    });
    expect(result).toEqual(expected);
  });

  it('should find by ID', async () => {
    const expected = {
      id: '1',
      companyId: 'c1',
      domainId: 'd1',
    } as CompanyDomain;
    (mockPrisma.companyDomain.findUnique as jest.Mock).mockResolvedValue(
      expected
    );

    const result = await repository.findById('1');

    expect(mockPrisma.companyDomain.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });
});
