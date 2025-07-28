import { Company } from '../../generated/prisma';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../../types/company';
import { CompanyAlreadyExistsError } from '../../errors/customErrors';
import { injectable, inject } from 'tsyringe';
import { ICompanyRepository } from '../../repositories/company/ICompanyRepository';

@injectable()
export class CompanyService implements ICompanyRepository {
  private companyRepository: ICompanyRepository;

  constructor(
    @inject('ICompanyRepository') companyRepository: ICompanyRepository
  ) {
    this.companyRepository = companyRepository;
  }

  async create(data: CreateCompanyRequest): Promise<Company> {
    const existingCompany = await this.getCompanyByName(data.name);
    if (existingCompany) {
      throw new CompanyAlreadyExistsError();
    }

    return this.companyRepository.create(data);
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.companyRepository.getCompanyById(id);
  }

  async getCompanyByName(name: string): Promise<Company | null> {
    return this.companyRepository.getCompanyByName(name);
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.getAllCompanies();
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyRequest
  ): Promise<Company> {
    return this.companyRepository.updateCompany(id, data);
  }

  async deleteCompany(id: string): Promise<Company> {
    return this.companyRepository.deleteCompany(id);
  }
}
