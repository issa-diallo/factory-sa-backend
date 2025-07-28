import { injectable, inject } from 'tsyringe';
import { Company, Prisma } from '../../generated/prisma';
import { ICompanyRepository } from './ICompanyRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async create(data: Prisma.CompanyCreateInput): Promise<Company> {
    return this.prisma.company.create({ data });
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async getCompanyByName(name: string): Promise<Company | null> {
    return this.prisma.company.findUnique({ where: { name } });
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }

  async updateCompany(
    id: string,
    data: Prisma.CompanyUpdateInput
  ): Promise<Company> {
    return this.prisma.company.update({ where: { id }, data });
  }

  async deleteCompany(id: string): Promise<Company> {
    return this.prisma.company.delete({ where: { id } });
  }
}
