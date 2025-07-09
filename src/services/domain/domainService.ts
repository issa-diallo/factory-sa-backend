import { PrismaClient, Domain, CompanyDomain } from '../../generated/prisma';
import {
  CreateDomainRequest,
  UpdateDomainRequest,
  CreateCompanyDomainRequest,
} from '../../types/domain';
import { IDomainService } from './interfaces';

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

  async getDomainById(id: string): Promise<Domain | null> {
    return this.prisma.domain.findUnique({
      where: { id },
    });
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
    return this.prisma.domain.update({
      where: { id },
      data,
    });
  }

  async deleteDomain(id: string): Promise<Domain> {
    return this.prisma.domain.delete({
      where: { id },
    });
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

  async getCompanyDomainById(id: string): Promise<CompanyDomain | null> {
    return this.prisma.companyDomain.findUnique({
      where: { id },
    });
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
    return this.prisma.companyDomain.delete({
      where: { id },
    });
  }
}
