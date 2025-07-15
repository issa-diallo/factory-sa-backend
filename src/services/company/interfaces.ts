import { Company } from '../../generated/prisma';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../../types/company';

export interface ICompanyService {
  createCompany(data: CreateCompanyRequest): Promise<Company>;
  getCompanyById(id: string): Promise<Company | null>;
  getCompanyByName(name: string): Promise<Company | null>;
  getAllCompanies(): Promise<Company[]>;
  updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company>;
  deleteCompany(id: string): Promise<Company>;
}
