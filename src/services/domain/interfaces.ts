import { CompanyDomain, Domain } from '../../generated/prisma';
import {
  CreateCompanyDomainRequest,
  CreateDomainRequest,
  UpdateDomainRequest,
} from '../../types/domain';

export interface IDomainService {
  createDomain(data: CreateDomainRequest): Promise<Domain>;
  getDomainById(id: string): Promise<Domain | null>;
  getDomainByName(name: string): Promise<Domain | null>;
  getAllDomains(): Promise<Domain[]>;
  updateDomain(id: string, data: UpdateDomainRequest): Promise<Domain>;
  deleteDomain(id: string): Promise<Domain>;

  createCompanyDomain(data: CreateCompanyDomainRequest): Promise<CompanyDomain>;
  getCompanyDomainById(id: string): Promise<CompanyDomain | null>;
  getCompanyDomainsByCompanyId(companyId: string): Promise<CompanyDomain[]>;
  getCompanyDomainsByDomainId(domainId: string): Promise<CompanyDomain[]>;
  deleteCompanyDomain(companyId: string, domainId: string): Promise<void>;
}
