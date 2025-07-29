import { injectable, inject } from 'tsyringe';
import { CompanyDomain, Prisma } from '../../generated/prisma';
import { ICompanyDomainRepository } from './ICompanyDomainRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaCompanyDomainRepository implements ICompanyDomainRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async findByDomainId(domainId: string): Promise<CompanyDomain | null> {
    return this.prisma.companyDomain.findFirst({ where: { domainId } });
  }

  async findByDomainIdWithCompany(
    domainId: string
  ): Promise<(CompanyDomain & { company: { isActive: boolean } }) | null> {
    return this.prisma.companyDomain.findFirst({
      where: { domainId },
      include: { company: true },
    });
  }

  async create(data: Prisma.CompanyDomainCreateInput): Promise<CompanyDomain> {
    return this.prisma.companyDomain.create({ data });
  }

  async delete(companyId: string, domainId: string): Promise<void> {
    await this.prisma.companyDomain.delete({
      where: {
        companyId_domainId: {
          companyId,
          domainId,
        },
      },
    });
  }

  async findByCompanyId(companyId: string): Promise<CompanyDomain[]> {
    return this.prisma.companyDomain.findMany({
      where: { companyId },
    });
  }

  async findAllByDomainId(domainId: string): Promise<CompanyDomain[]> {
    return this.prisma.companyDomain.findMany({
      where: { domainId },
    });
  }

  async findById(id: string): Promise<CompanyDomain | null> {
    return this.prisma.companyDomain.findUnique({
      where: { id },
    });
  }
}
