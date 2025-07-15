import { Request, Response } from 'express';
import { DomainController } from '../../src/controllers/domainController';
import { prisma } from '../../src/database/prismaClient';

function createMockResponse(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
  return res as unknown as Response;
}

describe('DomainController (static)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.companyDomain.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createDomain', () => {
    it('should create a domain and return 201 status', async () => {
      const req = {
        body: {
          name: 'example.com',
        },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.createDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'example.com',
        })
      );
    });

    it('should return 400 for invalid validation data', async () => {
      const req = { body: { name: 123 } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.createDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid validation data',
          errors: expect.any(Array),
        })
      );
    });

    it('should return 409 if domain name already exists', async () => {
      const req = {
        body: {
          name: 'existing.com',
        },
      } as unknown as Request;
      const res = createMockResponse();

      await prisma.domain.create({
        data: {
          name: req.body.name,
        },
      });

      await DomainController.createDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Domain with this name already exists.',
        })
      );
    });
  });

  describe('getDomainById', () => {
    it('should return 200 and domain if found', async () => {
      const newDomain = await prisma.domain.create({
        data: { name: 'test-get.com' },
      });

      const req = { params: { id: newDomain.id } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.getDomainById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: newDomain.id, name: 'test-get.com' })
      );
    });

    it('should return 404 if not found', async () => {
      const req = { params: { id: 'non-existent-id' } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.getDomainById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Domain not found' });
    });
  });

  describe('getAllDomains', () => {
    it('should return all domains', async () => {
      const domainsData = [{ name: 'domain1.com' }, { name: 'domain2.com' }];
      await prisma.domain.createMany({ data: domainsData });

      const req = {} as Request;
      const res = createMockResponse();

      await DomainController.getAllDomains(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'domain1.com' }),
          expect.objectContaining({ name: 'domain2.com' }),
        ])
      );
      expect((res.json as jest.Mock).mock.calls[0][0].length).toBe(2);
    });

    it('should return empty array and 200 status if no domains', async () => {
      const req = {} as Request;
      const res = createMockResponse();

      await DomainController.getAllDomains(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('updateDomain', () => {
    it('should update and return 200', async () => {
      const existingDomain = await prisma.domain.create({
        data: { name: 'old-domain.com' },
      });

      const req = {
        params: { id: existingDomain.id },
        body: { name: 'updated-domain.com' },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.updateDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'updated-domain.com' })
      );
    });

    it('should return 404 if domain not found', async () => {
      const req = {
        params: { id: 'non-existent-id' },
        body: { name: 'updated-domain.com' },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.updateDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Domain not found' });
    });

    it('should return 400 for invalid validation data', async () => {
      const existingDomain = await prisma.domain.create({
        data: { name: 'valid.com' },
      });

      const req = {
        params: { id: existingDomain.id },
        body: { name: 123 },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.updateDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid validation data',
          errors: expect.any(Array),
        })
      );
    });
  });

  describe('deleteDomain', () => {
    it('should delete and return 204', async () => {
      const domainToDelete = await prisma.domain.create({
        data: { name: 'to-delete.com' },
      });

      const req = { params: { id: domainToDelete.id } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.deleteDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();

      const deletedDomain = await prisma.domain.findUnique({
        where: { id: domainToDelete.id },
      });
      expect(deletedDomain).toBeNull();
    });

    it('should return 404 if domain not found', async () => {
      const req = { params: { id: 'non-existent-id' } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.deleteDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Domain not found' });
    });
  });

  describe('createCompanyDomain', () => {
    let companyId: string;
    let domainId: string;

    beforeEach(async () => {
      const company = await prisma.company.create({
        data: { name: 'TestCompany' },
      });
      const domain = await prisma.domain.create({
        data: { name: 'testcompany.com' },
      });
      companyId = company.id;
      domainId = domain.id;
    });

    it('should create a company domain and return 201 status', async () => {
      const req = {
        body: {
          companyId,
          domainId,
        },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.createCompanyDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId,
          domainId,
        })
      );
    });

    it('should return 400 for invalid validation data', async () => {
      const req = { body: { companyId: 'abc' } } as unknown as Request; // Missing domainId
      const res = createMockResponse();

      await DomainController.createCompanyDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid validation data',
          errors: expect.any(Array),
        })
      );
    });

    it('should return 409 if company domain already exists', async () => {
      await prisma.companyDomain.create({
        data: {
          companyId,
          domainId,
        },
      });

      const req = {
        body: {
          companyId,
          domainId,
        },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.createCompanyDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Unique constraint failed on the fields: (`companyId`,`domainId`)',
        })
      );
    });
  });

  describe('deleteCompanyDomain', () => {
    let companyDomainId: string;
    let companyId: string;
    let domainId: string;

    beforeEach(async () => {
      const company = await prisma.company.create({
        data: { name: 'AnotherCompany' },
      });
      const domain = await prisma.domain.create({
        data: { name: 'anothercompany.com' },
      });
      companyId = company.id;
      domainId = domain.id;

      const companyDomain = await prisma.companyDomain.create({
        data: {
          companyId,
          domainId,
        },
      });
      companyDomainId = companyDomain.id;
    });

    it('should delete a company domain and return 204', async () => {
      const req = { params: { id: companyDomainId } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.deleteCompanyDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();

      const deletedCompanyDomain = await prisma.companyDomain.findUnique({
        where: { id: companyDomainId },
      });
      expect(deletedCompanyDomain).toBeNull();
    });

    it('should return 404 if company domain not found', async () => {
      const req = { params: { id: 'non-existent-id' } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.deleteCompanyDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company domain not found',
      });
    });
  });

  describe('Error Handling 500', () => {
    it('should return 500 if an unexpected error occurs during createDomain', async () => {
      const spy = jest
        .spyOn(prisma.domain, 'create')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      const req = { body: { name: 'error.com' } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.createDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected DB error' });

      spy.mockRestore();
    });

    it('should return 500 if an unexpected error occurs during getDomainById', async () => {
      const spy = jest
        .spyOn(prisma.domain, 'findUnique')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      const req = { params: { id: 'some-id' } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.getDomainById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected DB error' });

      spy.mockRestore();
    });

    it('should return 500 if an unexpected error occurs during getAllDomains', async () => {
      const spy = jest
        .spyOn(prisma.domain, 'findMany')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      const req = {} as Request;
      const res = createMockResponse();

      await DomainController.getAllDomains(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected DB error' });

      spy.mockRestore();
    });

    it('should return 500 if an unexpected error occurs during updateDomain', async () => {
      const spy = jest
        .spyOn(prisma.domain, 'findUnique')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      const req = {
        params: { id: 'some-id' },
        body: { name: 'new.com' },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.updateDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected DB error' });

      spy.mockRestore();
    });

    it('should return 500 if an unexpected error occurs during deleteDomain', async () => {
      const spy = jest
        .spyOn(prisma.domain, 'findUnique')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      const req = { params: { id: 'some-id' } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.deleteDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected DB error' });

      spy.mockRestore();
    });

    it('should return 500 if an unexpected error occurs during createCompanyDomain', async () => {
      const spy = jest
        .spyOn(prisma.companyDomain, 'create')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      // Ensure valid data to bypass Zod validation and hit the service layer
      const company = await prisma.company.create({
        data: { name: 'ErrorCompany' },
      });
      const domain = await prisma.domain.create({
        data: { name: 'errorcompany.com' },
      });

      const req = {
        body: { companyId: company.id, domainId: domain.id },
      } as unknown as Request;
      const res = createMockResponse();

      await DomainController.createCompanyDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected DB error' });

      spy.mockRestore();
    });

    it('should return 500 if an unexpected error occurs during deleteCompanyDomain', async () => {
      const spy = jest
        .spyOn(prisma.companyDomain, 'findUnique')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      const req = { params: { id: 'some-id' } } as unknown as Request;
      const res = createMockResponse();

      await DomainController.deleteCompanyDomain(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected DB error' });

      spy.mockRestore();
    });
  });
});
