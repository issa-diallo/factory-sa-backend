import { ICompanyService } from './interfaces';
import { Company, PrismaClient } from '../../generated/prisma';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../../types/company';

export class CompanyService implements ICompanyService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    return this.prisma.company.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  async getCompanyByName(name: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { name },
    });
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyRequest
  ): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async deleteCompany(id: string): Promise<Company> {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
