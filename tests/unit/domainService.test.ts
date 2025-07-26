import { DomainService } from '../../src/services/domain/domainService';
import {
  CreateDomainRequest,
  UpdateDomainRequest,
  CreateCompanyDomainRequest,
} from '../../src/types/domain';
import { Domain, CompanyDomain } from '../../src/generated/prisma';

// Mock the entire prismaClient module
jest.mock('../../src/database/prismaClient', () => ({
  prisma: {
    domain: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    companyDomain: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = {
  domain: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  companyDomain: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as {
  domain: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  companyDomain: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    delete: jest.Mock;
  };
};

describe('DomainService', () => {
  let domainService: DomainService;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    domainService = new DomainService(mockPrisma as any);
    jest.clearAllMocks();
  });

  describe('createDomain', () => {
    it('should successfully create a new domain', async () => {
      const domainData: CreateDomainRequest = {
        name: 'test.com',
        isActive: true,
      };
      const createdDomain: Domain = {
        id: 'domain1',
        name: domainData.name,
        isActive: domainData.isActive ?? true, // Ensure isActive is always boolean
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.domain.create.mockResolvedValue(createdDomain);

      const result = await domainService.createDomain(domainData);

      expect(mockPrisma.domain.create).toHaveBeenCalledWith({
        data: {
          name: domainData.name,
          isActive: domainData.isActive,
        },
      });
      expect(result).toEqual(createdDomain);
    });

    it('should create a new domain with isActive defaulting to true if not provided', async () => {
      const domainData: CreateDomainRequest = {
        name: 'default.com',
      };
      const createdDomain: Domain = {
        id: 'domain2',
        name: domainData.name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.domain.create.mockResolvedValue(createdDomain);

      const result = await domainService.createDomain(domainData);

      expect(mockPrisma.domain.create).toHaveBeenCalledWith({
        data: {
          name: domainData.name,
          isActive: true,
        },
      });
      expect(result).toEqual(createdDomain);
    });

    it('should reject if creation fails', async () => {
      const domainData: CreateDomainRequest = {
        name: 'fail.com',
        isActive: true,
      };
      const error = new Error('Database error');
      mockPrisma.domain.create.mockRejectedValue(error);

      await expect(domainService.createDomain(domainData)).rejects.toThrow(
        error
      );
      expect(mockPrisma.domain.create).toHaveBeenCalledWith({
        data: {
          name: domainData.name,
          isActive: domainData.isActive,
        },
      });
    });
  });

  describe('getDomainById', () => {
    it('should return a domain by ID', async () => {
      const domainId = 'domain1';
      const domain: Domain = {
        id: domainId,
        name: 'test.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.domain.findUnique.mockResolvedValue(domain);

      const result = await domainService.getDomainById(domainId);

      expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
        where: { id: domainId },
      });
      expect(result).toEqual(domain);
    });

    it('should throw DomainNotFoundError if no domain is found by ID', async () => {
      const domainId = 'nonexistent';
      mockPrisma.domain.findUnique.mockResolvedValue(null);

      await expect(domainService.getDomainById(domainId)).rejects.toThrow(
        `Domain with ID ${domainId} not found.`
      );
      expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
        where: { id: domainId },
      });
    });

    it('should reject if fetching by ID fails', async () => {
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockPrisma.domain.findUnique.mockRejectedValue(error);

      await expect(domainService.getDomainById(domainId)).rejects.toThrow(
        error
      );
      expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
        where: { id: domainId },
      });
    });
  });

  describe('getDomainByName', () => {
    it('should return a domain by name', async () => {
      const domainName = 'test.com';
      const domain: Domain = {
        id: 'domain1',
        name: domainName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.domain.findUnique.mockResolvedValue(domain);

      const result = await domainService.getDomainByName(domainName);

      expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
        where: { name: domainName },
      });
      expect(result).toEqual(domain);
    });

    it('should return null if no domain is found by name', async () => {
      const domainName = 'nonexistent.com';
      mockPrisma.domain.findUnique.mockResolvedValue(null);

      const result = await domainService.getDomainByName(domainName);

      expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
        where: { name: domainName },
      });
      expect(result).toBeNull();
    });

    it('should reject if fetching by name fails', async () => {
      const domainName = 'test.com';
      const error = new Error('Database error');
      mockPrisma.domain.findUnique.mockRejectedValue(error);

      await expect(domainService.getDomainByName(domainName)).rejects.toThrow(
        error
      );
      expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
        where: { name: domainName },
      });
    });
  });

  describe('getAllDomains', () => {
    it('should return all domains', async () => {
      const domains: Domain[] = [
        {
          id: 'domain1',
          name: 'domain1.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'domain2',
          name: 'domain2.com',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.domain.findMany.mockResolvedValue(domains);

      const result = await domainService.getAllDomains();

      expect(mockPrisma.domain.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(domains);
    });

    it('should return an empty array if no domains are found', async () => {
      mockPrisma.domain.findMany.mockResolvedValue([]);

      const result = await domainService.getAllDomains();

      expect(mockPrisma.domain.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should reject if fetching all domains fails', async () => {
      const error = new Error('Database error');
      mockPrisma.domain.findMany.mockRejectedValue(error);

      await expect(domainService.getAllDomains()).rejects.toThrow(error);
      expect(mockPrisma.domain.findMany).toHaveBeenCalledWith();
    });
  });

  describe('updateDomain', () => {
    it('should successfully update a domain', async () => {
      const domainId = 'domain1';
      const updateData: UpdateDomainRequest = {
        name: 'updated.com',
        isActive: false,
      };
      const updatedDomain: Domain = {
        id: domainId,
        name: 'updated.com',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.domain.update.mockResolvedValue(updatedDomain);

      const result = await domainService.updateDomain(domainId, updateData);

      expect(mockPrisma.domain.update).toHaveBeenCalledWith({
        where: { id: domainId },
        data: updateData,
      });
      expect(result).toEqual(updatedDomain);
    });

    it('should reject if update fails', async () => {
      const domainId = 'domain1';
      const updateData: UpdateDomainRequest = { name: 'fail-update.com' };
      const error = new Error('Database error');
      mockPrisma.domain.update.mockRejectedValue(error);

      await expect(
        domainService.updateDomain(domainId, updateData)
      ).rejects.toThrow(error);
      expect(mockPrisma.domain.update).toHaveBeenCalledWith({
        where: { id: domainId },
        data: updateData,
      });
    });
  });

  describe('deleteDomain', () => {
    it('should successfully delete a domain', async () => {
      const domainId = 'domain1';
      const deletedDomain: Domain = {
        id: domainId,
        name: 'deleted.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.domain.delete.mockResolvedValue(deletedDomain);

      const result = await domainService.deleteDomain(domainId);

      expect(mockPrisma.domain.delete).toHaveBeenCalledWith({
        where: { id: domainId },
      });
      expect(result).toEqual(deletedDomain);
    });

    it('should reject if deletion fails', async () => {
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockPrisma.domain.delete.mockRejectedValue(error);

      await expect(domainService.deleteDomain(domainId)).rejects.toThrow(error);
      expect(mockPrisma.domain.delete).toHaveBeenCalledWith({
        where: { id: domainId },
      });
    });
  });

  describe('createCompanyDomain', () => {
    it('should successfully create a new company domain', async () => {
      const companyDomainData: CreateCompanyDomainRequest = {
        companyId: 'company1',
        domainId: 'domain1',
      };
      const createdCompanyDomain: CompanyDomain = {
        id: 'companyDomain1',
        ...companyDomainData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.companyDomain.create.mockResolvedValue(createdCompanyDomain);

      const result = await domainService.createCompanyDomain(companyDomainData);

      expect(mockPrisma.companyDomain.create).toHaveBeenCalledWith({
        data: {
          companyId: companyDomainData.companyId,
          domainId: companyDomainData.domainId,
        },
      });
      expect(result).toEqual(createdCompanyDomain);
    });

    it('should reject if creation fails', async () => {
      const companyDomainData: CreateCompanyDomainRequest = {
        companyId: 'company1',
        domainId: 'domain1',
      };
      const error = new Error('Database error');
      mockPrisma.companyDomain.create.mockRejectedValue(error);

      await expect(
        domainService.createCompanyDomain(companyDomainData)
      ).rejects.toThrow(error);
      expect(mockPrisma.companyDomain.create).toHaveBeenCalledWith({
        data: {
          companyId: companyDomainData.companyId,
          domainId: companyDomainData.domainId,
        },
      });
    });
  });

  describe('getCompanyDomainById', () => {
    it('should return a company domain by ID', async () => {
      const companyDomainId = 'companyDomain1';
      const companyDomain: CompanyDomain = {
        id: companyDomainId,
        companyId: 'company1',
        domainId: 'domain1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.companyDomain.findUnique.mockResolvedValue(companyDomain);

      const result = await domainService.getCompanyDomainById(companyDomainId);

      expect(mockPrisma.companyDomain.findUnique).toHaveBeenCalledWith({
        where: { id: companyDomainId },
      });
      expect(result).toEqual(companyDomain);
    });

    it('should throw CompanyDomainNotFoundError if no company domain is found by ID', async () => {
      const companyDomainId = 'nonexistent';
      mockPrisma.companyDomain.findUnique.mockResolvedValue(null);

      await expect(
        domainService.getCompanyDomainById(companyDomainId)
      ).rejects.toThrow(`Company domain with ID ${companyDomainId} not found.`);
      expect(mockPrisma.companyDomain.findUnique).toHaveBeenCalledWith({
        where: { id: companyDomainId },
      });
    });

    it('should reject if fetching by ID fails', async () => {
      const companyDomainId = 'companyDomain1';
      const error = new Error('Database error');
      mockPrisma.companyDomain.findUnique.mockRejectedValue(error);

      await expect(
        domainService.getCompanyDomainById(companyDomainId)
      ).rejects.toThrow(error);
      expect(mockPrisma.companyDomain.findUnique).toHaveBeenCalledWith({
        where: { id: companyDomainId },
      });
    });
  });

  describe('getCompanyDomainsByCompanyId', () => {
    it('should return company domains by company ID', async () => {
      const companyId = 'company1';
      const companyDomains: CompanyDomain[] = [
        {
          id: 'companyDomain1',
          companyId: companyId,
          domainId: 'domain1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'companyDomain2',
          companyId: companyId,
          domainId: 'domain2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.companyDomain.findMany.mockResolvedValue(companyDomains);

      const result =
        await domainService.getCompanyDomainsByCompanyId(companyId);

      expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
        where: { companyId },
      });
      expect(result).toEqual(companyDomains);
    });

    it('should return an empty array if no company domains are found by company ID', async () => {
      const companyId = 'nonexistent';
      mockPrisma.companyDomain.findMany.mockResolvedValue([]);

      const result =
        await domainService.getCompanyDomainsByCompanyId(companyId);

      expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
        where: { companyId },
      });
      expect(result).toEqual([]);
    });

    it('should reject if fetching by company ID fails', async () => {
      const companyId = 'company1';
      const error = new Error('Database error');
      mockPrisma.companyDomain.findMany.mockRejectedValue(error);

      await expect(
        domainService.getCompanyDomainsByCompanyId(companyId)
      ).rejects.toThrow(error);
      expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
        where: { companyId },
      });
    });
  });

  describe('getCompanyDomainsByDomainId', () => {
    it('should return company domains by domain ID', async () => {
      const domainId = 'domain1';
      const companyDomains: CompanyDomain[] = [
        {
          id: 'companyDomain1',
          companyId: 'company1',
          domainId: domainId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'companyDomain3',
          companyId: 'company2',
          domainId: domainId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.companyDomain.findMany.mockResolvedValue(companyDomains);

      const result = await domainService.getCompanyDomainsByDomainId(domainId);

      expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
        where: { domainId },
      });
      expect(result).toEqual(companyDomains);
    });

    it('should return an empty array if no company domains are found by domain ID', async () => {
      const domainId = 'nonexistent';
      mockPrisma.companyDomain.findMany.mockResolvedValue([]);

      const result = await domainService.getCompanyDomainsByDomainId(domainId);

      expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
        where: { domainId },
      });
      expect(result).toEqual([]);
    });

    it('should reject if fetching by domain ID fails', async () => {
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockPrisma.companyDomain.findMany.mockRejectedValue(error);

      await expect(
        domainService.getCompanyDomainsByDomainId(domainId)
      ).rejects.toThrow(error);
      expect(mockPrisma.companyDomain.findMany).toHaveBeenCalledWith({
        where: { domainId },
      });
    });
    it('should throw DomainNotFoundError if domain to update is not found (P2025)', async () => {
      const domainId = 'notfound';
      const updateData: UpdateDomainRequest = { name: 'notfound.com' };

      const prismaError = {
        code: 'P2025',
        message: 'Record to update not found.',
        name: 'PrismaClientKnownRequestError',
      };

      mockPrisma.domain.update.mockRejectedValue(prismaError);

      await expect(
        domainService.updateDomain(domainId, updateData)
      ).rejects.toThrow(`Domain with ID ${domainId} not found.`);

      expect(mockPrisma.domain.update).toHaveBeenCalledWith({
        where: { id: domainId },
        data: updateData,
      });
    });
  });

  describe('deleteCompanyDomain', () => {
    it('should successfully delete a company domain', async () => {
      const companyId = 'company1';
      const domainId = 'domain1';

      mockPrisma.companyDomain.delete.mockResolvedValue({});

      await expect(
        domainService.deleteCompanyDomain(companyId, domainId)
      ).resolves.toBeUndefined();

      expect(mockPrisma.companyDomain.delete).toHaveBeenCalledWith({
        where: { companyId_domainId: { companyId, domainId } },
      });
    });

    it('should reject if deletion fails', async () => {
      const companyId = 'company1';
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockPrisma.companyDomain.delete.mockRejectedValue(error);

      await expect(
        domainService.deleteCompanyDomain(companyId, domainId)
      ).rejects.toThrow(error);
      expect(mockPrisma.companyDomain.delete).toHaveBeenCalledWith({
        where: { companyId_domainId: { companyId, domainId } },
      });
    });
  });
});
