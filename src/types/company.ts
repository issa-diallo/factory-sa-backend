export interface CreateCompanyRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CompanyResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCompanyRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}
