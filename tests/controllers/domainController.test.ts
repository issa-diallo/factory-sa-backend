import { DomainController } from '../../src/controllers/domainController';
import { IDomainService } from '../../src/services/domain/interfaces';
import {
  DomainNotFoundError,
  CompanyDomainNotFoundError,
} from '../../src/errors/customErrors';
import { Request, Response } from 'express';
import { generateValidDomain } from '../fixtures/domain/generateDomainFixtures';
import { Domain } from '../../src/generated/prisma';
import { faker } from '@faker-js/faker';
const createMockResponse = (): Response => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;
};

describe('DomainController with dependency injection', () => {
  let controller: DomainController;
  let mockService: jest.Mocked<IDomainService>;
  let res: Response;

  beforeEach(() => {
    mockService = {
      createDomain: jest.fn(),
      getDomainById: jest.fn(),
      getDomainByName: jest.fn(),
      getAllDomains: jest.fn(),
      updateDomain: jest.fn(),
      deleteDomain: jest.fn(),
      createCompanyDomain: jest.fn(),
      getCompanyDomainById: jest.fn(),
      getCompanyDomainsByCompanyId: jest.fn(),
      getCompanyDomainsByDomainId: jest.fn(),
      deleteCompanyDomain: jest.fn(),
      getDomainsByCompanyId: jest.fn(),
      getDomainsByCompanyIdWithPagination: jest.fn(),
      searchDomainsByCompanyId: jest.fn(),
    };
    controller = new DomainController(mockService);
    res = createMockResponse();
  });

  describe('createDomain', () => {
    it('should create a domain and return 201', async () => {
      const newDomain = generateValidDomain()[0];
      const req = { body: newDomain } as Request;
      mockService.createDomain.mockResolvedValue({
        id: 'domain-id-1',
        ...newDomain,
      } as Domain);

      await controller.createDomain(req, res);

      expect(mockService.createDomain).toHaveBeenCalledWith(newDomain);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'domain-id-1', name: newDomain.name })
      );
    });

    it('should return 400 if validation fails', async () => {
      const req = { body: { name: 123 } } as unknown as Request;

      await controller.createDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid validation data' })
      );
    });

    it('should return 409 if domain already exists', async () => {
      const existingDomain = generateValidDomain()[0];
      const req = { body: existingDomain } as Request;
      mockService.createDomain.mockRejectedValue({ code: 'P2002' });

      await controller.createDomain(req, res);

      expect(mockService.createDomain).toHaveBeenCalledWith(existingDomain);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Domain already exists.',
        })
      );
    });

    it('should return 500 for unknown error', async () => {
      const newDomain = generateValidDomain()[0];
      const req = { body: newDomain } as Request;
      mockService.createDomain.mockRejectedValue(
        new Error('Something went wrong')
      );

      await controller.createDomain(req, res);

      expect(mockService.createDomain).toHaveBeenCalledWith(newDomain);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Something went wrong' })
      );
    });
  });

  describe('getDomainById', () => {
    it('should return 200 and domain if found', async () => {
      const domainId = 'domain-id-get';
      const foundDomain = {
        id: domainId,
        ...generateValidDomain()[0],
      } as Domain;
      const req = { params: { id: domainId } } as unknown as Request;
      mockService.getDomainById.mockResolvedValueOnce(foundDomain);

      await controller.getDomainById(req, res);

      expect(mockService.getDomainById).toHaveBeenCalledWith(domainId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(foundDomain)
      );
    });

    it('should return 404 if domain not found', async () => {
      const domainId = 'non-existent-id';
      const req = { params: { id: domainId } } as unknown as Request;
      mockService.getDomainById.mockRejectedValueOnce(
        new DomainNotFoundError(`Domain with ID ${domainId} not found.`)
      );

      await controller.getDomainById(req, res);

      expect(mockService.getDomainById).toHaveBeenCalledWith(domainId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `Domain with ID ${domainId} not found.`,
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const domainId = 'error-id';
      const req = { params: { id: domainId } } as unknown as Request;
      mockService.getDomainById.mockRejectedValueOnce(
        new Error('Database error')
      );

      await controller.getDomainById(req, res);

      expect(mockService.getDomainById).toHaveBeenCalledWith(domainId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Database error' })
      );
    });
  });

  describe('getAllDomains', () => {
    it('should return all domains', async () => {
      const domains = generateValidDomain(2).map((d, i) => ({
        id: `domain-id-${i + 1}`,
        ...d,
      })) as Domain[];
      const req = {} as Request;
      mockService.getAllDomains.mockResolvedValueOnce(domains);

      await controller.getAllDomains(req, res);

      expect(mockService.getAllDomains).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(domains));
      expect((res.json as jest.Mock).mock.calls[0][0].length).toBe(2);
    });

    it('should return empty array if no domains', async () => {
      const req = {} as Request;
      mockService.getAllDomains.mockResolvedValueOnce([]);

      await controller.getAllDomains(req, res);

      expect(mockService.getAllDomains).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const req = {} as Request;
      mockService.getAllDomains.mockRejectedValueOnce(
        new Error('Network error')
      );

      await controller.getAllDomains(req, res);

      expect(mockService.getAllDomains).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Network error' })
      );
    });
  });

  describe('updateDomain', () => {
    it('should update a domain and return 200', async () => {
      const domainId = 'domain-id-update';
      const updatedData = {
        name: 'updated.com',
        isActive: false,
      };
      const existingDomain = {
        id: domainId,
        ...generateValidDomain()[0],
      } as Domain;
      const updatedDomain = { ...existingDomain, ...updatedData } as Domain;

      const req = {
        params: { id: domainId },
        body: updatedData,
      } as unknown as Request;
      mockService.updateDomain.mockResolvedValueOnce(updatedDomain);

      await controller.updateDomain(req, res);

      expect(mockService.updateDomain).toHaveBeenCalledWith(
        domainId,
        updatedData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(updatedDomain)
      );
    });

    it('should return 404 if domain not found', async () => {
      const domainId = 'non-existent-update-id';
      const req = {
        params: { id: domainId },
        body: { name: 'new.com' },
      } as unknown as Request;
      mockService.updateDomain.mockRejectedValueOnce(
        new DomainNotFoundError(`Domain with ID ${domainId} not found.`)
      );

      await controller.updateDomain(req, res);

      expect(mockService.updateDomain).toHaveBeenCalledWith(domainId, req.body);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `Domain with ID ${domainId} not found.`,
      });
    });

    it('should return 400 for invalid validation data', async () => {
      const domainId = 'domain-id-invalid-update';
      const req = {
        params: { id: domainId },
        body: { name: 123 },
      } as unknown as Request; // Invalid data
      await controller.updateDomain(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid validation data' })
      );
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const domainId = 'error-update-id';
      const updatedData = { name: 'error.com' };
      const req = {
        params: { id: domainId },
        body: updatedData,
      } as unknown as Request;
      mockService.updateDomain.mockRejectedValueOnce(
        new Error('Update failed')
      );

      await controller.updateDomain(req, res);

      expect(mockService.updateDomain).toHaveBeenCalledWith(
        domainId,
        updatedData
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Update failed' })
      );
    });
  });

  describe('deleteDomain', () => {
    it('should delete a domain and return 204', async () => {
      const domainId = 'domain-id-delete';
      const req = { params: { id: domainId } } as unknown as Request;
      const deletedDomain = {
        id: domainId,
        ...generateValidDomain()[0],
      } as Domain;
      mockService.deleteDomain.mockResolvedValueOnce(deletedDomain);

      await controller.deleteDomain(req, res);

      expect(mockService.deleteDomain).toHaveBeenCalledWith(domainId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if domain not found', async () => {
      const domainId = 'non-existent-delete-id';
      const req = { params: { id: domainId } } as unknown as Request;
      mockService.deleteDomain.mockRejectedValueOnce(
        new DomainNotFoundError(`Domain with ID ${domainId} not found.`)
      );

      await controller.deleteDomain(req, res);

      expect(mockService.deleteDomain).toHaveBeenCalledWith(domainId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `Domain with ID ${domainId} not found.`,
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const domainId = 'error-delete-id';
      const req = { params: { id: domainId } } as unknown as Request;
      mockService.deleteDomain.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      await controller.deleteDomain(req, res);

      expect(mockService.deleteDomain).toHaveBeenCalledWith(domainId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Delete failed' })
      );
    });
  });

  describe('createCompanyDomain', () => {
    it('should create a company-domain relationship and return 201', async () => {
      const companyId = faker.string.uuid();
      const domainId = faker.string.uuid();
      const req = { body: { companyId, domainId } } as Request;
      const newCompanyDomain = {
        companyId,
        domainId,
        id: faker.string.uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockService.createCompanyDomain.mockResolvedValueOnce(newCompanyDomain);

      await controller.createCompanyDomain(req, res);

      expect(mockService.createCompanyDomain).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(newCompanyDomain)
      );
    });

    it('should return 400 if validation fails', async () => {
      const req = {
        body: { companyId: 'invalid-uuid', domainId: 'invalid-uuid' },
      } as unknown as Request;
      await controller.createCompanyDomain(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid validation data' })
      );
    });

    it('should return 409 if relationship already exists', async () => {
      const companyId = faker.string.uuid();
      const domainId = faker.string.uuid();
      const req = { body: { companyId, domainId } } as Request;
      mockService.createCompanyDomain.mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['companyId', 'domainId'] },
      });

      await controller.createCompanyDomain(req, res);

      expect(mockService.createCompanyDomain).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company-domain relationship already exists.',
        })
      );
    });

    it('should return 500 for unknown error', async () => {
      const companyId = faker.string.uuid();
      const domainId = faker.string.uuid();
      const req = { body: { companyId, domainId } } as Request;
      mockService.createCompanyDomain.mockRejectedValueOnce(
        new Error('Relationship error')
      );

      await controller.createCompanyDomain(req, res);

      expect(mockService.createCompanyDomain).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Relationship error' })
      );
    });
  });

  describe('deleteCompanyDomain', () => {
    it('should delete a company-domain relationship and return 204', async () => {
      const companyId = faker.string.uuid();
      const domainId = faker.string.uuid();
      const req = { params: { companyId, domainId } } as unknown as Request;

      mockService.deleteCompanyDomain.mockResolvedValueOnce();

      await controller.deleteCompanyDomain(req, res);

      expect(mockService.deleteCompanyDomain).toHaveBeenCalledWith(
        req.params.companyId,
        req.params.domainId
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if relationship not found', async () => {
      const companyId = faker.string.uuid();
      const domainId = faker.string.uuid();
      const req = { params: { companyId, domainId } } as unknown as Request;
      mockService.deleteCompanyDomain.mockRejectedValueOnce(
        new CompanyDomainNotFoundError(
          `Company domain with ID ${req.params.companyId}-${req.params.domainId} not found.`
        )
      );

      await controller.deleteCompanyDomain(req, res);

      expect(mockService.deleteCompanyDomain).toHaveBeenCalledWith(
        req.params.companyId,
        req.params.domainId
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `Company domain with ID ${req.params.companyId}-${req.params.domainId} not found.`,
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const companyId = faker.string.uuid();
      const domainId = faker.string.uuid();
      const req = { params: { companyId, domainId } } as unknown as Request;
      mockService.deleteCompanyDomain.mockRejectedValueOnce(
        new Error('Deletion error')
      );

      await controller.deleteCompanyDomain(req, res);

      expect(mockService.deleteCompanyDomain).toHaveBeenCalledWith(
        req.params.companyId,
        req.params.domainId
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Deletion error' })
      );
    });
  });

  describe('getCompanyDomainsByCompanyId', () => {
    it('should return all company-domains for a specific company', async () => {
      const companyId = faker.string.uuid();
      const companyDomains = [
        {
          id: faker.string.uuid(),
          companyId,
          domainId: faker.string.uuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          companyId,
          domainId: faker.string.uuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const req = { params: { companyId } } as unknown as Request;
      mockService.getCompanyDomainsByCompanyId.mockResolvedValueOnce(
        companyDomains
      );

      await controller.getCompanyDomainsByCompanyId(req, res);

      expect(mockService.getCompanyDomainsByCompanyId).toHaveBeenCalledWith(
        companyId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining(companyDomains)
      );
      expect((res.json as jest.Mock).mock.calls[0][0]).toHaveLength(2);
    });

    it('should return empty array if no company-domains found', async () => {
      const companyId = faker.string.uuid();
      const req = { params: { companyId } } as unknown as Request;
      mockService.getCompanyDomainsByCompanyId.mockResolvedValueOnce([]);

      await controller.getCompanyDomainsByCompanyId(req, res);

      expect(mockService.getCompanyDomainsByCompanyId).toHaveBeenCalledWith(
        companyId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const companyId = faker.string.uuid();
      const req = { params: { companyId } } as unknown as Request;
      mockService.getCompanyDomainsByCompanyId.mockRejectedValueOnce(
        new Error('Database error')
      );

      await controller.getCompanyDomainsByCompanyId(req, res);

      expect(mockService.getCompanyDomainsByCompanyId).toHaveBeenCalledWith(
        companyId
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Database error' })
      );
    });
  });
});
