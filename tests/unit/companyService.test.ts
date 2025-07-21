import { CompanyService } from '../../src/services/company/companyService';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../../src/types/company';
import { prisma } from '../../src/database/prismaClient';
import { CompanyAlreadyExistsError } from '../../src/errors/customErrors';

// Mock the entire prismaClient module
jest.mock('../../src/database/prismaClient', () => ({
  prisma: {
    company: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Cast prisma to a mocked version for type safety
const mockPrisma = prisma as unknown as {
  company: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('CompanyService', () => {
  let companyService: CompanyService;

  beforeEach(() => {
    companyService = new CompanyService();
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    it('should throw CompanyAlreadyExistsError if company with same name exists', async () => {
      const companyData: CreateCompanyRequest = {
        name: 'Existing Company',
        description: 'Description',
        isActive: true,
      };

      mockPrisma.company.findUnique.mockResolvedValue({
        id: 'existing-id',
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(companyService.createCompany(companyData)).rejects.toThrow(
        CompanyAlreadyExistsError
      );
      expect(mockPrisma.company.create).not.toHaveBeenCalled();
    });

    it('should successfully create a new company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      const companyData: CreateCompanyRequest = {
        name: 'Test Company',
        description: 'Description for test company',
        isActive: true,
      };
      const createdCompany = {
        id: '1',
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.company.create.mockResolvedValue(createdCompany);

      const result = await companyService.createCompany(companyData);

      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: {
          name: companyData.name,
          description: companyData.description,
          isActive: companyData.isActive,
        },
      });
      expect(result).toEqual(createdCompany);
    });

    it('should create a new company with isActive defaulting to true if not provided', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      const companyData: CreateCompanyRequest = {
        name: 'Default Active Company',
        description: 'Description for default active company',
      };
      const createdCompany = {
        id: '2',
        ...companyData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.company.create.mockResolvedValue(createdCompany);

      const result = await companyService.createCompany(companyData);

      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: {
          name: companyData.name,
          description: companyData.description,
          isActive: true, // Verifies that isActive defaults to true
        },
      });
      expect(result).toEqual(createdCompany);
    });

    it('should reject if creation fails', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      const companyData: CreateCompanyRequest = {
        name: 'Failing Company',
        description: 'This company will fail',
        isActive: true,
      };
      const error = new Error('Database error');
      mockPrisma.company.create.mockRejectedValue(error);

      await expect(companyService.createCompany(companyData)).rejects.toThrow(
        error
      );
      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: {
          name: companyData.name,
          description: companyData.description,
          isActive: companyData.isActive,
        },
      });
    });
  });

  describe('getCompanyById', () => {
    it('should return a company by ID', async () => {
      const companyId = '1';
      const company = {
        id: companyId,
        name: 'Test Company',
        description: 'Desc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.company.findUnique.mockResolvedValue(company);

      const result = await companyService.getCompanyById(companyId);

      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: companyId },
      });
      expect(result).toEqual(company);
    });

    it('should return null if no company is found by ID', async () => {
      const companyId = 'nonexistent';
      mockPrisma.company.findUnique.mockResolvedValue(null);

      const result = await companyService.getCompanyById(companyId);

      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: companyId },
      });
      expect(result).toBeNull();
    });

    it('should reject if fetching by ID fails', async () => {
      const companyId = '1';
      const error = new Error('Database error');
      mockPrisma.company.findUnique.mockRejectedValue(error);

      await expect(companyService.getCompanyById(companyId)).rejects.toThrow(
        error
      );
      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: companyId },
      });
    });
  });

  describe('getCompanyByName', () => {
    it('should return a company by name', async () => {
      const companyName = 'Test Company';
      const company = {
        id: '1',
        name: companyName,
        description: 'Desc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.company.findUnique.mockResolvedValue(company);

      const result = await companyService.getCompanyByName(companyName);

      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { name: companyName },
      });
      expect(result).toEqual(company);
    });

    it('should return null if no company is found by name', async () => {
      const companyName = 'nonexistent';
      mockPrisma.company.findUnique.mockResolvedValue(null);

      const result = await companyService.getCompanyByName(companyName);

      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { name: companyName },
      });
      expect(result).toBeNull();
    });

    it('should reject if fetching by name fails', async () => {
      const companyName = 'Test Company';
      const error = new Error('Database error');
      mockPrisma.company.findUnique.mockRejectedValue(error);

      await expect(
        companyService.getCompanyByName(companyName)
      ).rejects.toThrow(error);
      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { name: companyName },
      });
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const companies = [
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
      mockPrisma.company.findMany.mockResolvedValue(companies);

      const result = await companyService.getAllCompanies();

      expect(mockPrisma.company.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(companies);
    });

    it('should return an empty array if no companies are found', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);

      const result = await companyService.getAllCompanies();

      expect(mockPrisma.company.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should reject if fetching all companies fails', async () => {
      const error = new Error('Database error');
      mockPrisma.company.findMany.mockRejectedValue(error);

      await expect(companyService.getAllCompanies()).rejects.toThrow(error);
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith();
    });
  });

  describe('updateCompany', () => {
    it('should successfully update a company', async () => {
      const companyId = '1';
      const updateData: UpdateCompanyRequest = {
        name: 'Updated Company',
        description: 'Updated Description',
      };
      const updatedCompany = {
        id: companyId,
        ...updateData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.company.update.mockResolvedValue(updatedCompany);

      const result = await companyService.updateCompany(companyId, updateData);

      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: companyId },
        data: updateData,
      });
      expect(result).toEqual(updatedCompany);
    });

    it('should reject if update fails', async () => {
      const companyId = '1';
      const updateData: UpdateCompanyRequest = { name: 'Updated Company' };
      const error = new Error('Database error');
      mockPrisma.company.update.mockRejectedValue(error);

      await expect(
        companyService.updateCompany(companyId, updateData)
      ).rejects.toThrow(error);
      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: companyId },
        data: updateData,
      });
    });
  });

  describe('deleteCompany', () => {
    it('should successfully delete a company', async () => {
      const companyId = '1';
      const deletedCompany = {
        id: companyId,
        name: 'Deleted Company',
        description: 'Desc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.company.delete.mockResolvedValue(deletedCompany);

      const result = await companyService.deleteCompany(companyId);

      expect(mockPrisma.company.delete).toHaveBeenCalledWith({
        where: { id: companyId },
      });
      expect(result).toEqual(deletedCompany);
    });

    it('should reject if deletion fails', async () => {
      const companyId = '1';
      const error = new Error('Database error');
      mockPrisma.company.delete.mockRejectedValue(error);

      await expect(companyService.deleteCompany(companyId)).rejects.toThrow(
        error
      );
      expect(mockPrisma.company.delete).toHaveBeenCalledWith({
        where: { id: companyId },
      });
    });
  });
});
