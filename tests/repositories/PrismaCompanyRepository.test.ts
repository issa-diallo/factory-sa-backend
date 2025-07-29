import { PrismaCompanyRepository } from '../../src/repositories/company/PrismaCompanyRepository';
import { IPrismaService } from '../../src/database/interfaces';
import { Company, Prisma } from '../../src/generated/prisma';

type MockedPrismaMethod<T> = jest.Mock<Promise<T>, [unknown]>;

const mockPrisma: IPrismaService = {
  company: {
    create: jest.fn() as MockedPrismaMethod<Company>,
    findUnique: jest.fn() as MockedPrismaMethod<Company | null>,
    findMany: jest.fn() as MockedPrismaMethod<Company[]>,
    update: jest.fn() as MockedPrismaMethod<Company>,
    delete: jest.fn() as MockedPrismaMethod<Company>,
  },
} as unknown as IPrismaService;

describe('PrismaCompanyRepository', () => {
  let repository: PrismaCompanyRepository;

  beforeEach(() => {
    repository = new PrismaCompanyRepository(mockPrisma);
    jest.clearAllMocks();
  });

  it('should create a company', async () => {
    const input: Prisma.CompanyCreateInput = {
      name: 'Tech Solutions',
    } as Prisma.CompanyCreateInput;
    const expected = { id: '1', name: 'Tech Solutions' } as Company;
    (mockPrisma.company.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.create(input);

    expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: input });
    expect(result).toEqual(expected);
  });

  it('should return a company by ID', async () => {
    const expected = { id: '1', name: 'Tech Solutions' } as Company;
    (mockPrisma.company.findUnique as jest.Mock).mockResolvedValue(expected);

    const result = await repository.getCompanyById('1');

    expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });

  it('should return a company by name', async () => {
    const expected = { id: '1', name: 'Tech Solutions' } as Company;
    (mockPrisma.company.findUnique as jest.Mock).mockResolvedValue(expected);

    const result = await repository.getCompanyByName('Tech Solutions');

    expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
      where: { name: 'Tech Solutions' },
    });
    expect(result).toEqual(expected);
  });

  it('should return all companies', async () => {
    const expected = [
      { id: '1', name: 'Tech Solutions' },
      { id: '2', name: 'Other Co' },
    ] as Company[];
    (mockPrisma.company.findMany as jest.Mock).mockResolvedValue(expected);

    const result = await repository.getAllCompanies();

    expect(mockPrisma.company.findMany).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('should update a company', async () => {
    const data: Prisma.CompanyUpdateInput = { name: 'Updated Name' };
    const expected = { id: '1', name: 'Updated Name' } as Company;
    (mockPrisma.company.update as jest.Mock).mockResolvedValue(expected);

    const result = await repository.updateCompany('1', data);

    expect(mockPrisma.company.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data,
    });
    expect(result).toEqual(expected);
  });

  it('should delete a company', async () => {
    const expected = { id: '1', name: 'Deleted Co' } as Company;
    (mockPrisma.company.delete as jest.Mock).mockResolvedValue(expected);

    const result = await repository.deleteCompany('1');

    expect(mockPrisma.company.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(expected);
  });
});
