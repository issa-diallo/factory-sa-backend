import { Domain, CompanyDomain } from '../../generated/prisma';
import {
  CreateDomainRequest,
  UpdateDomainRequest,
  CreateCompanyDomainRequest,
} from '../../types/domain';
import { IDomainService } from './interfaces';
import {
  DomainNotFoundError,
  CompanyDomainNotFoundError,
} from '../../errors/customErrors';
import { injectable, inject } from 'tsyringe';
import { IDomainRepository } from '../../repositories/domain/IDomainRepository';
import { ICompanyDomainRepository } from '../../repositories/companyDomain/ICompanyDomainRepository';

@injectable()
export class DomainService implements IDomainService {
  private domainRepository: IDomainRepository;
  private companyDomainRepository: ICompanyDomainRepository;

  constructor(
    @inject('IDomainRepository') domainRepository: IDomainRepository,
    @inject('ICompanyDomainRepository')
    companyDomainRepository: ICompanyDomainRepository
  ) {
    this.domainRepository = domainRepository;
    this.companyDomainRepository = companyDomainRepository;
  }

  async createDomain(data: CreateDomainRequest): Promise<Domain> {
    return this.domainRepository.create(data);
  }

  async getDomainById(id: string): Promise<Domain> {
    const domain = await this.domainRepository.findById(id);
    if (!domain)
      throw new DomainNotFoundError(`Domain with ID ${id} not found.`);
    return domain;
  }

  async getDomainByName(name: string): Promise<Domain | null> {
    return this.domainRepository.findByDomainName(name);
  }

  async getAllDomains(): Promise<Domain[]> {
    return this.domainRepository.findAll();
  }

  async updateDomain(id: string, data: UpdateDomainRequest): Promise<Domain> {
    try {
      return await this.domainRepository.update(id, data);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new DomainNotFoundError(`Domain with ID ${id} not found.`);
      }

      throw error;
    }
  }

  async deleteDomain(id: string): Promise<Domain> {
    return this.domainRepository.delete(id);
  }

  async createCompanyDomain(
    data: CreateCompanyDomainRequest
  ): Promise<CompanyDomain> {
    const prismaData = {
      company: { connect: { id: data.companyId } },
      domain: { connect: { id: data.domainId } },
    };
    return this.companyDomainRepository.create(prismaData);
  }

  async getCompanyDomainById(id: string): Promise<CompanyDomain> {
    const companyDomain = await this.companyDomainRepository.findById(id);
    if (!companyDomain) {
      throw new CompanyDomainNotFoundError(
        `Company domain with ID ${id} not found.`
      );
    }
    return companyDomain;
  }

  async getCompanyDomainsByCompanyId(
    companyId: string
  ): Promise<CompanyDomain[]> {
    return this.companyDomainRepository.findByCompanyId(companyId);
  }

  async getCompanyDomainsByDomainId(
    domainId: string
  ): Promise<CompanyDomain[]> {
    return this.companyDomainRepository.findAllByDomainId(domainId);
  }

  async deleteCompanyDomain(
    companyId: string,
    domainId: string
  ): Promise<void> {
    await this.companyDomainRepository.delete(companyId, domainId);
  }

  async getDomainsByCompanyId(companyId: string): Promise<Domain[]> {
    return this.domainRepository.findDomainsByCompany(companyId);
  }

  async getDomainsByCompanyIdWithPagination(
    companyId: string,
    page: number,
    limit: number
  ): Promise<{ domains: Domain[]; total: number }> {
    const skip = (page - 1) * limit;
    const domains = await this.domainRepository.findDomainsByCompany(companyId);

    // For simple pagination, we manually filter
    // In a real implementation, we would use Prisma with skip/take
    const paginatedDomains = domains.slice(skip, skip + limit);

    return {
      domains: paginatedDomains,
      total: domains.length,
    };
  }

  async searchDomainsByCompanyId(
    companyId: string,
    searchTerm: string
  ): Promise<Domain[]> {
    const domains = await this.domainRepository.findDomainsByCompany(companyId);

    // Simple filtering by domain name
    return domains.filter(domain =>
      domain.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
