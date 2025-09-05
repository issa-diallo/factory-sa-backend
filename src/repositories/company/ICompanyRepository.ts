import { Company, Prisma } from '../../generated/prisma';

export interface ICompanyRepository {
  create(data: Prisma.CompanyCreateInput): Promise<Company>;
  getCompanyById(id: string): Promise<Company | null>;
  getCompanyByName(name: string): Promise<Company | null>;
  getAllCompanies(filter?: { companyId?: string }): Promise<Company[]>;
  updateCompany(id: string, data: Prisma.CompanyUpdateInput): Promise<Company>;
  deleteCompany(id: string): Promise<Company>;

  // Nouvelles méthodes pour le filtrage par utilisateur
  getCompaniesByUser(
    userId: string,
    isSystemAdmin: boolean
  ): Promise<Company[]>;
  canUserAccessCompany(
    companyId: string,
    userId: string,
    isSystemAdmin: boolean
  ): Promise<boolean>;
}
