import { DomainService } from '../../src/services/domain/domainService';
import {
  CreateDomainRequest,
  UpdateDomainRequest,
  CreateCompanyDomainRequest,
} from '../../src/types/domain';
import { Domain, CompanyDomain } from '../../src/generated/prisma';
import { IDomainRepository } from '../../src/repositories/domain/IDomainRepository';
import { ICompanyDomainRepository } from '../../src/repositories/companyDomain/ICompanyDomainRepository';
import {
  DomainNotFoundError,
  CompanyDomainNotFoundError,
} from '../../src/errors/customErrors';

const mockDomainRepository: jest.Mocked<IDomainRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByDomainName: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findDomainsByCompany: jest.fn(),
  findDomainWithCompanyValidation: jest.fn(),
};

const mockCompanyDomainRepository: jest.Mocked<ICompanyDomainRepository> = {
  findByDomainId: jest.fn(),
  findByDomainIdWithCompany: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findByCompanyId: jest.fn(),
  findAllByDomainId: jest.fn(),
  findById: jest.fn(),
};

describe('DomainService', () => {
  let domainService: DomainService;

  beforeEach(() => {
    jest.clearAllMocks();
    domainService = new DomainService(
      mockDomainRepository,
      mockCompanyDomainRepository
    );
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
        isActive: domainData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDomainRepository.create.mockResolvedValue(createdDomain);

      const result = await domainService.createDomain(domainData);

      expect(mockDomainRepository.create).toHaveBeenCalledWith(domainData);
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
      mockDomainRepository.create.mockResolvedValue(createdDomain);

      const result = await domainService.createDomain(domainData);

      expect(mockDomainRepository.create).toHaveBeenCalledWith(domainData);
      expect(result).toEqual(createdDomain);
    });

    it('should reject if creation fails', async () => {
      const domainData: CreateDomainRequest = {
        name: 'fail.com',
        isActive: true,
      };
      const error = new Error('Database error');
      mockDomainRepository.create.mockRejectedValue(error);

      await expect(domainService.createDomain(domainData)).rejects.toThrow(
        error
      );
      expect(mockDomainRepository.create).toHaveBeenCalledWith(domainData);
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
      mockDomainRepository.findById.mockResolvedValue(domain);

      const result = await domainService.getDomainById(domainId);

      expect(mockDomainRepository.findById).toHaveBeenCalledWith(domainId);
      expect(result).toEqual(domain);
    });

    it('should throw DomainNotFoundError if no domain is found by ID', async () => {
      const domainId = 'nonexistent';
      mockDomainRepository.findById.mockResolvedValue(null);

      await expect(domainService.getDomainById(domainId)).rejects.toThrow(
        new DomainNotFoundError(`Domain with ID ${domainId} not found.`)
      );
      expect(mockDomainRepository.findById).toHaveBeenCalledWith(domainId);
    });

    it('should reject if fetching by ID fails', async () => {
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockDomainRepository.findById.mockRejectedValue(error);

      await expect(domainService.getDomainById(domainId)).rejects.toThrow(
        error
      );
      expect(mockDomainRepository.findById).toHaveBeenCalledWith(domainId);
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
      mockDomainRepository.findByDomainName.mockResolvedValue(domain);

      const result = await domainService.getDomainByName(domainName);

      expect(mockDomainRepository.findByDomainName).toHaveBeenCalledWith(
        domainName
      );
      expect(result).toEqual(domain);
    });

    it('should return null if no domain is found by name', async () => {
      const domainName = 'nonexistent.com';
      mockDomainRepository.findByDomainName.mockResolvedValue(null);

      const result = await domainService.getDomainByName(domainName);

      expect(mockDomainRepository.findByDomainName).toHaveBeenCalledWith(
        domainName
      );
      expect(result).toBeNull();
    });

    it('should reject if fetching by name fails', async () => {
      const domainName = 'test.com';
      const error = new Error('Database error');
      mockDomainRepository.findByDomainName.mockRejectedValue(error);

      await expect(domainService.getDomainByName(domainName)).rejects.toThrow(
        error
      );
      expect(mockDomainRepository.findByDomainName).toHaveBeenCalledWith(
        domainName
      );
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
      mockDomainRepository.findAll.mockResolvedValue(domains);

      const result = await domainService.getAllDomains();

      expect(mockDomainRepository.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(domains);
    });

    it('should return an empty array if no domains are found', async () => {
      mockDomainRepository.findAll.mockResolvedValue([]);

      const result = await domainService.getAllDomains();

      expect(mockDomainRepository.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should reject if fetching all domains fails', async () => {
      const error = new Error('Database error');
      mockDomainRepository.findAll.mockRejectedValue(error);

      await expect(domainService.getAllDomains()).rejects.toThrow(error);
      expect(mockDomainRepository.findAll).toHaveBeenCalledWith();
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
      mockDomainRepository.update.mockResolvedValue(updatedDomain);

      const result = await domainService.updateDomain(domainId, updateData);

      expect(mockDomainRepository.update).toHaveBeenCalledWith(
        domainId,
        updateData
      );
      expect(result).toEqual(updatedDomain);
    });

    it('should throw DomainNotFoundError if domain to update is not found (P2025)', async () => {
      const domainId = 'notfound';
      const updateData: UpdateDomainRequest = { name: 'notfound.com' };

      const prismaError = {
        code: 'P2025',
        message: 'Record to update not found.',
        name: 'PrismaClientKnownRequestError',
      };

      mockDomainRepository.update.mockRejectedValue(prismaError);

      await expect(
        domainService.updateDomain(domainId, updateData)
      ).rejects.toThrow(
        new DomainNotFoundError(`Domain with ID ${domainId} not found.`)
      );

      expect(mockDomainRepository.update).toHaveBeenCalledWith(
        domainId,
        updateData
      );
    });

    it('should reject if update fails with generic error', async () => {
      const domainId = 'domain1';
      const updateData: UpdateDomainRequest = { name: 'fail-update.com' };
      const error = new Error('Database error');
      mockDomainRepository.update.mockRejectedValue(error);

      await expect(
        domainService.updateDomain(domainId, updateData)
      ).rejects.toThrow(error);
      expect(mockDomainRepository.update).toHaveBeenCalledWith(
        domainId,
        updateData
      );
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
      mockDomainRepository.delete.mockResolvedValue(deletedDomain);

      const result = await domainService.deleteDomain(domainId);

      expect(mockDomainRepository.delete).toHaveBeenCalledWith(domainId);
      expect(result).toEqual(deletedDomain);
    });

    it('should reject if deletion fails', async () => {
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockDomainRepository.delete.mockRejectedValue(error);

      await expect(domainService.deleteDomain(domainId)).rejects.toThrow(error);
      expect(mockDomainRepository.delete).toHaveBeenCalledWith(domainId);
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
        companyId: companyDomainData.companyId,
        domainId: companyDomainData.domainId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyDomainRepository.create.mockResolvedValue(
        createdCompanyDomain
      );

      const result = await domainService.createCompanyDomain(companyDomainData);

      expect(mockCompanyDomainRepository.create).toHaveBeenCalledWith({
        company: { connect: { id: companyDomainData.companyId } },
        domain: { connect: { id: companyDomainData.domainId } },
      });
      expect(result).toEqual(createdCompanyDomain);
    });

    it('should reject if creation fails', async () => {
      const companyDomainData: CreateCompanyDomainRequest = {
        companyId: 'company1',
        domainId: 'domain1',
      };
      const error = new Error('Database error');
      mockCompanyDomainRepository.create.mockRejectedValue(error);

      await expect(
        domainService.createCompanyDomain(companyDomainData)
      ).rejects.toThrow(error);
      expect(mockCompanyDomainRepository.create).toHaveBeenCalledWith({
        company: { connect: { id: companyDomainData.companyId } },
        domain: { connect: { id: companyDomainData.domainId } },
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
      mockCompanyDomainRepository.findById.mockResolvedValue(companyDomain);

      const result = await domainService.getCompanyDomainById(companyDomainId);

      expect(mockCompanyDomainRepository.findById).toHaveBeenCalledWith(
        companyDomainId
      );
      expect(result).toEqual(companyDomain);
    });

    it('should throw CompanyDomainNotFoundError if no company domain is found by ID', async () => {
      const companyDomainId = 'nonexistent';
      mockCompanyDomainRepository.findById.mockResolvedValue(null);

      await expect(
        domainService.getCompanyDomainById(companyDomainId)
      ).rejects.toThrow(
        new CompanyDomainNotFoundError(
          `Company domain with ID ${companyDomainId} not found.`
        )
      );
      expect(mockCompanyDomainRepository.findById).toHaveBeenCalledWith(
        companyDomainId
      );
    });

    it('should reject if fetching by ID fails', async () => {
      const companyDomainId = 'companyDomain1';
      const error = new Error('Database error');
      mockCompanyDomainRepository.findById.mockRejectedValue(error);

      await expect(
        domainService.getCompanyDomainById(companyDomainId)
      ).rejects.toThrow(error);
      expect(mockCompanyDomainRepository.findById).toHaveBeenCalledWith(
        companyDomainId
      );
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
      mockCompanyDomainRepository.findByCompanyId.mockResolvedValue(
        companyDomains
      );

      const result =
        await domainService.getCompanyDomainsByCompanyId(companyId);

      expect(mockCompanyDomainRepository.findByCompanyId).toHaveBeenCalledWith(
        companyId
      );
      expect(result).toEqual(companyDomains);
    });

    it('should return an empty array if no company domains are found by company ID', async () => {
      const companyId = 'nonexistent';
      mockCompanyDomainRepository.findByCompanyId.mockResolvedValue([]);

      const result =
        await domainService.getCompanyDomainsByCompanyId(companyId);

      expect(mockCompanyDomainRepository.findByCompanyId).toHaveBeenCalledWith(
        companyId
      );
      expect(result).toEqual([]);
    });

    it('should reject if fetching by company ID fails', async () => {
      const companyId = 'company1';
      const error = new Error('Database error');
      mockCompanyDomainRepository.findByCompanyId.mockRejectedValue(error);

      await expect(
        domainService.getCompanyDomainsByCompanyId(companyId)
      ).rejects.toThrow(error);
      expect(mockCompanyDomainRepository.findByCompanyId).toHaveBeenCalledWith(
        companyId
      );
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
      mockCompanyDomainRepository.findAllByDomainId.mockResolvedValue(
        companyDomains
      );

      const result = await domainService.getCompanyDomainsByDomainId(domainId);

      expect(
        mockCompanyDomainRepository.findAllByDomainId
      ).toHaveBeenCalledWith(domainId);
      expect(result).toEqual(companyDomains);
    });

    it('should return an empty array if no company domains are found by domain ID', async () => {
      const domainId = 'nonexistent';
      mockCompanyDomainRepository.findAllByDomainId.mockResolvedValue([]);

      const result = await domainService.getCompanyDomainsByDomainId(domainId);

      expect(
        mockCompanyDomainRepository.findAllByDomainId
      ).toHaveBeenCalledWith(domainId);
      expect(result).toEqual([]);
    });

    it('should reject if fetching by domain ID fails', async () => {
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockCompanyDomainRepository.findAllByDomainId.mockRejectedValue(error);

      await expect(
        domainService.getCompanyDomainsByDomainId(domainId)
      ).rejects.toThrow(error);
      expect(
        mockCompanyDomainRepository.findAllByDomainId
      ).toHaveBeenCalledWith(domainId);
    });
  });

  describe('deleteCompanyDomain', () => {
    it('should successfully delete a company domain', async () => {
      const companyId = 'company1';
      const domainId = 'domain1';

      mockCompanyDomainRepository.delete.mockResolvedValue(undefined);

      await expect(
        domainService.deleteCompanyDomain(companyId, domainId)
      ).resolves.toBeUndefined();

      expect(mockCompanyDomainRepository.delete).toHaveBeenCalledWith(
        companyId,
        domainId
      );
    });

    it('should reject if deletion fails', async () => {
      const companyId = 'company1';
      const domainId = 'domain1';
      const error = new Error('Database error');
      mockCompanyDomainRepository.delete.mockRejectedValue(error);

      await expect(
        domainService.deleteCompanyDomain(companyId, domainId)
      ).rejects.toThrow(error);
      expect(mockCompanyDomainRepository.delete).toHaveBeenCalledWith(
        companyId,
        domainId
      );
    });
  });
});
