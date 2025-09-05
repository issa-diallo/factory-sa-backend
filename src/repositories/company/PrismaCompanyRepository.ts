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

  async getAllCompanies(filter?: { companyId?: string }): Promise<Company[]> {
    if (filter?.companyId) {
      return this.prisma.company.findMany({
        where: { id: filter.companyId },
      });
    }
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

  async getCompaniesByUser(
    userId: string,
    isSystemAdmin: boolean
  ): Promise<Company[]> {
    if (isSystemAdmin) {
      // System Admin : retourner toutes les entreprises
      return this.getAllCompanies();
    }

    // Utilisateur normal : retourner seulement son entreprise
    const userRole = await this.prisma.userRole.findFirst({
      where: { userId },
      include: { company: true },
    });

    return userRole ? [userRole.company] : [];
  }

  async canUserAccessCompany(
    companyId: string,
    userId: string,
    isSystemAdmin: boolean
  ): Promise<boolean> {
    if (isSystemAdmin) {
      // System Admin : peut accéder à toute entreprise
      return true;
    }

    // Vérifier que l'utilisateur appartient à cette entreprise
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        companyId,
      },
    });

    return userRole !== null;
  }
}
