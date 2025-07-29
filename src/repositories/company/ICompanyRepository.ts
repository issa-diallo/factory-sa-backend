import { Company, Prisma } from '../../generated/prisma';

export interface ICompanyRepository {
  create(data: Prisma.CompanyCreateInput): Promise<Company>;
  getCompanyById(id: string): Promise<Company | null>;
  getCompanyByName(name: string): Promise<Company | null>;
  getAllCompanies(): Promise<Company[]>;
  updateCompany(id: string, data: Prisma.CompanyUpdateInput): Promise<Company>;
  deleteCompany(id: string): Promise<Company>;
}
