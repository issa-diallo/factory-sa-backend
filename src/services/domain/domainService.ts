import { PrismaClient, Domain, CompanyDomain } from '../../generated/prisma';
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

export class DomainService implements IDomainService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createDomain(data: CreateDomainRequest): Promise<Domain> {
    return this.prisma.domain.create({
      data: {
        name: data.name,
        isActive: data.isActive ?? true,
      },
    });
  }

  async getDomainById(id: string): Promise<Domain> {
    const domain = await this.prisma.domain.findUnique({
      where: { id },
    });
    if (!domain) {
      throw new DomainNotFoundError(`Domain with ID ${id} not found.`);
    }
    return domain;
  }

  async getDomainByName(name: string): Promise<Domain | null> {
    return this.prisma.domain.findUnique({
      where: { name },
    });
  }

  async getAllDomains(): Promise<Domain[]> {
    return this.prisma.domain.findMany();
  }

  async updateDomain(id: string, data: UpdateDomainRequest): Promise<Domain> {
    try {
      return await this.prisma.domain.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new DomainNotFoundError(`Domain with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async deleteDomain(id: string): Promise<Domain> {
    try {
      return await this.prisma.domain.delete({
        where: { id },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new DomainNotFoundError(`Domain with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async createCompanyDomain(
    data: CreateCompanyDomainRequest
  ): Promise<CompanyDomain> {
    return this.prisma.companyDomain.create({
      data: {
        companyId: data.companyId,
        domainId: data.domainId,
      },
    });
  }

  async getCompanyDomainById(id: string): Promise<CompanyDomain> {
    const companyDomain = await this.prisma.companyDomain.findUnique({
      where: { id },
    });
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
    return this.prisma.companyDomain.findMany({
      where: { companyId },
    });
  }

  async getCompanyDomainsByDomainId(
    domainId: string
  ): Promise<CompanyDomain[]> {
    return this.prisma.companyDomain.findMany({
      where: { domainId },
    });
  }

  async deleteCompanyDomain(id: string): Promise<CompanyDomain> {
    try {
      return await this.prisma.companyDomain.delete({
        where: { id },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new CompanyDomainNotFoundError(
          `Company domain with ID ${id} not found.`
        );
      }
      throw error;
    }
  }
}
