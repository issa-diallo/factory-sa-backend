import { CompanyDomain, Prisma } from '../../generated/prisma';

export interface ICompanyDomainRepository {
  findByDomainId(domainId: string): Promise<CompanyDomain | null>;
  findByDomainIdWithCompany(
    domainId: string
  ): Promise<(CompanyDomain & { company: { isActive: boolean } }) | null>;
  create(data: Prisma.CompanyDomainCreateInput): Promise<CompanyDomain>;
  delete(companyId: string, domainId: string): Promise<void>;
  findByCompanyId(companyId: string): Promise<CompanyDomain[]>;
  findAllByDomainId(domainId: string): Promise<CompanyDomain[]>;
  findById(id: string): Promise<CompanyDomain | null>;
}
