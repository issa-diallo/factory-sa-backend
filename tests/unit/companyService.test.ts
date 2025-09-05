import { CompanyService } from '../../src/services/company/companyService';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../../src/types/company';
import { CompanyAlreadyExistsError } from '../../src/errors/customErrors';
import { ICompanyRepository } from '../../src/repositories/company/ICompanyRepository';
import { Company } from '../../src/generated/prisma';

// Mock the ICompanyRepository
const mockCompanyRepository: jest.Mocked<ICompanyRepository> = {
  create: jest.fn(),
  getCompanyById: jest.fn(),
  getCompanyByName: jest.fn(),
  getAllCompanies: jest.fn(),
  updateCompany: jest.fn(),
  deleteCompany: jest.fn(),
  getCompaniesByUser: jest.fn(),
  canUserAccessCompany: jest.fn(),
};

describe('CompanyService', () => {
  let companyService: CompanyService;

  beforeEach(() => {
    // Instanciez CompanyService en lui passant le mock de ICompanyRepository
    companyService = new CompanyService(mockCompanyRepository);
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    it('should throw CompanyAlreadyExistsError if company with same name exists', async () => {
      const companyData: CreateCompanyRequest = {
        name: 'Existing Company',
        description: 'Description',
        isActive: true,
      };

      // Assurez-vous que le type de retour correspond au modèle Prisma.Company
      mockCompanyRepository.getCompanyByName.mockResolvedValue({
        id: 'existing-id',
        name: companyData.name,
        description: companyData.description || null, // Assurez-vous que description est string | null
        isActive: companyData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Company);

      await expect(companyService.create(companyData)).rejects.toThrow(
        CompanyAlreadyExistsError
      );
      expect(mockCompanyRepository.create).not.toHaveBeenCalled();
    });

    it('should successfully create a new company', async () => {
      mockCompanyRepository.getCompanyByName.mockResolvedValue(null);
      const companyData: CreateCompanyRequest = {
        name: 'Test Company',
        description: 'Description for test company',
        isActive: true,
      };
      const createdCompany: Company = {
        // Spécifiez le type Company
        id: '1',
        name: companyData.name,
        description: companyData.description || null,
        isActive: companyData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyRepository.create.mockResolvedValue(createdCompany);

      const result = await companyService.create(companyData);

      expect(mockCompanyRepository.create).toHaveBeenCalledWith(companyData);
      expect(result).toEqual(createdCompany);
    });

    it('should create a new company with isActive defaulting to true if not provided', async () => {
      mockCompanyRepository.getCompanyByName.mockResolvedValue(null);
      const companyData: CreateCompanyRequest = {
        name: 'Default Active Company',
        description: 'Description for default active company',
      };
      const createdCompany: Company = {
        // Spécifiez le type Company
        id: '2',
        name: companyData.name,
        description: companyData.description || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyRepository.create.mockResolvedValue(createdCompany);

      const result = await companyService.create(companyData);

      expect(mockCompanyRepository.create).toHaveBeenCalledWith(companyData);
      expect(result).toEqual(createdCompany);
    });

    it('should reject if creation fails', async () => {
      mockCompanyRepository.getCompanyByName.mockResolvedValue(null);
      const companyData: CreateCompanyRequest = {
        name: 'Failing Company',
        description: 'This company will fail',
        isActive: true,
      };
      const error = new Error('Database error');
      mockCompanyRepository.create.mockRejectedValue(error);

      await expect(companyService.create(companyData)).rejects.toThrow(error);
      expect(mockCompanyRepository.create).toHaveBeenCalledWith(companyData);
    });
  });

  describe('getCompanyById', () => {
    it('should return a company by ID', async () => {
      const companyId = '1';
      const company: Company = {
        // Spécifiez le type Company
        id: companyId,
        name: 'Test Company',
        description: 'Desc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyRepository.getCompanyById.mockResolvedValue(company);

      const result = await companyService.getCompanyById(companyId);

      expect(mockCompanyRepository.getCompanyById).toHaveBeenCalledWith(
        companyId
      );
      expect(result).toEqual(company);
    });

    it('should return null if no company is found by ID', async () => {
      const companyId = 'nonexistent';
      mockCompanyRepository.getCompanyById.mockResolvedValue(null);

      const result = await companyService.getCompanyById(companyId);

      expect(mockCompanyRepository.getCompanyById).toHaveBeenCalledWith(
        companyId
      );
      expect(result).toBeNull();
    });

    it('should reject if fetching by ID fails', async () => {
      const companyId = '1';
      const error = new Error('Database error');
      mockCompanyRepository.getCompanyById.mockRejectedValue(error);

      await expect(companyService.getCompanyById(companyId)).rejects.toThrow(
        error
      );
      expect(mockCompanyRepository.getCompanyById).toHaveBeenCalledWith(
        companyId
      );
    });
  });

  describe('getCompanyByName', () => {
    it('should return a company by name', async () => {
      const companyName = 'Test Company';
      const company: Company = {
        // Spécifiez le type Company
        id: '1',
        name: companyName,
        description: 'Desc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyRepository.getCompanyByName.mockResolvedValue(company);

      const result = await companyService.getCompanyByName(companyName);

      expect(mockCompanyRepository.getCompanyByName).toHaveBeenCalledWith(
        companyName
      );
      expect(result).toEqual(company);
    });

    it('should return null if no company is found by name', async () => {
      const companyName = 'nonexistent';
      mockCompanyRepository.getCompanyByName.mockResolvedValue(null);

      const result = await companyService.getCompanyByName(companyName);

      expect(mockCompanyRepository.getCompanyByName).toHaveBeenCalledWith(
        companyName
      );
      expect(result).toBeNull();
    });

    it('should reject if fetching by name fails', async () => {
      const companyName = 'Test Company';
      const error = new Error('Database error');
      mockCompanyRepository.getCompanyByName.mockRejectedValue(error);

      await expect(
        companyService.getCompanyByName(companyName)
      ).rejects.toThrow(error);
      expect(mockCompanyRepository.getCompanyByName).toHaveBeenCalledWith(
        companyName
      );
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const companies: Company[] = [
        // Spécifiez le type Company[]
        {
          id: '1',
          name: 'Comp1',
          description: 'Desc1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Comp2',
          description: 'Desc2',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCompanyRepository.getAllCompanies.mockResolvedValue(companies);

      const result = await companyService.getAllCompanies();

      expect(mockCompanyRepository.getAllCompanies).toHaveBeenCalledWith(
        undefined
      );
      expect(result).toEqual(companies);
    });

    it('should return an empty array if no companies are found', async () => {
      mockCompanyRepository.getAllCompanies.mockResolvedValue([]);

      const result = await companyService.getAllCompanies();

      expect(mockCompanyRepository.getAllCompanies).toHaveBeenCalledWith(
        undefined
      );
      expect(result).toEqual([]);
    });

    it('should reject if fetching all companies fails', async () => {
      const error = new Error('Database error');
      mockCompanyRepository.getAllCompanies.mockRejectedValue(error);

      await expect(companyService.getAllCompanies()).rejects.toThrow(error);
      expect(mockCompanyRepository.getAllCompanies).toHaveBeenCalledWith(
        undefined
      );
    });
  });

  describe('updateCompany', () => {
    it('should successfully update a company', async () => {
      const companyId = '1';
      const updateData: UpdateCompanyRequest = {
        name: 'Updated Company',
        description: 'Updated Description',
      };
      const updatedCompany: Company = {
        // Spécifiez le type Company
        id: companyId,
        name: updateData.name || 'Default Name', // Assurez-vous que name est string
        description: updateData.description || null, // Assurez-vous que description est string | null
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyRepository.updateCompany.mockResolvedValue(updatedCompany);

      const result = await companyService.updateCompany(companyId, updateData);

      expect(mockCompanyRepository.updateCompany).toHaveBeenCalledWith(
        companyId,
        updateData
      );
      expect(result).toEqual(updatedCompany);
    });

    it('should reject if update fails', async () => {
      const companyId = '1';
      const updateData: UpdateCompanyRequest = { name: 'Updated Company' };
      const error = new Error('Database error');
      mockCompanyRepository.updateCompany.mockRejectedValue(error);

      await expect(
        companyService.updateCompany(companyId, updateData)
      ).rejects.toThrow(error);
      expect(mockCompanyRepository.updateCompany).toHaveBeenCalledWith(
        companyId,
        updateData
      );
    });
  });

  describe('deleteCompany', () => {
    it('should successfully delete a company', async () => {
      const companyId = '1';
      const deletedCompany: Company = {
        // Spécifiez le type Company
        id: companyId,
        name: 'Deleted Company',
        description: 'Desc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyRepository.deleteCompany.mockResolvedValue(deletedCompany);

      const result = await companyService.deleteCompany(companyId);

      expect(mockCompanyRepository.deleteCompany).toHaveBeenCalledWith(
        companyId
      );
      expect(result).toEqual(deletedCompany);
    });

    it('should reject if deletion fails', async () => {
      const companyId = '1';
      const error = new Error('Database error');
      mockCompanyRepository.deleteCompany.mockRejectedValue(error);

      await expect(companyService.deleteCompany(companyId)).rejects.toThrow(
        error
      );
      expect(mockCompanyRepository.deleteCompany).toHaveBeenCalledWith(
        companyId
      );
    });
  });
});
