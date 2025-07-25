import { ICompanyService } from './interfaces';
import { Company } from '../../generated/prisma';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../../types/company';
import { prisma } from '../../database/prismaClient';
import { CompanyAlreadyExistsError } from '../../errors/customErrors';
import { injectable } from 'tsyringe';

@injectable()
export class CompanyService implements ICompanyService {
  constructor() {}

  private prisma = prisma;

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    const existingCompany = await this.getCompanyByName(data.name);
    if (existingCompany) {
      throw new CompanyAlreadyExistsError();
    }

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
