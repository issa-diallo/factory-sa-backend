export interface CreateDomainRequest {
  name: string;
  isActive?: boolean;
}

export interface DomainResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDomainRequest {
  name?: string;
  isActive?: boolean;
}

export interface CreateCompanyDomainRequest {
  companyId: string;
  domainId: string;
}

export interface CompanyDomainResponse {
  id: string;
  companyId: string;
  domainId: string;
  createdAt: Date;
  updatedAt: Date;
}
