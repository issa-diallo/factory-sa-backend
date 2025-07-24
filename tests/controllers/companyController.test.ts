import { Request, Response } from 'express';
import { CompanyController } from '../../src/controllers/companyController';
import { prisma } from '../../src/database/prismaClient';

function createMockResponse(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
  return res as unknown as Response;
}

describe('CompanyController', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.company.deleteMany();
    await prisma.$disconnect();
  });

  describe('createCompany', () => {
    it('should create a company and return 201 status', async () => {
      const req = {
        body: {
          name: 'Test Company',
          description: 'A test company',
          isActive: true,
        },
      } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.createCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Company',
        })
      );
      const createdCompany = await prisma.company.findUnique({
        where: { name: 'Test Company' },
      });
      expect(createdCompany).not.toBeNull();
      expect(createdCompany?.name).toBe('Test Company');
    });

    it('should return 400 for invalid validation data', async () => {
      const req = { body: { name: 123 } } as unknown as Request; // Invalid data
      const res = createMockResponse();

      await CompanyController.createCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid validation data',
          errors: expect.any(Array),
        })
      );
      const companyCount = await prisma.company.count();
      expect(companyCount).toBe(0);
    });

    it('should return 409 if company name already exists', async () => {
      const existingCompanyName = 'Existing Company';
      await prisma.company.create({
        data: {
          name: existingCompanyName,
          description: 'An existing company',
          isActive: true,
        },
      });

      const req = {
        body: {
          name: existingCompanyName,
          description: 'Another existing company',
          isActive: true,
        },
      } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.createCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company with this name already exists.',
        })
      );
      const companyCount = await prisma.company.count();
      expect(companyCount).toBe(1);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const req = {
        body: {
          name: 'Error Company',
          description: 'A company with an error',
          isActive: true,
        },
      } as unknown as Request;
      const res = createMockResponse();

      const spy = jest
        .spyOn(prisma.company, 'create')
        .mockRejectedValueOnce(new Error('Database connection failed'));

      await CompanyController.createCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database connection failed',
        })
      );
      spy.mockRestore();
    });
  });

  describe('getCompanyById', () => {
    it('should return 200 and company if found', async () => {
      const company = await prisma.company.create({
        data: {
          name: 'Found Company',
          description: 'A found company',
          isActive: true,
        },
      });
      const req = { params: { id: company.id } } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.getCompanyById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: company.id, name: 'Found Company' })
      );
    });

    it('should return 404 if company not found', async () => {
      const req = { params: { id: 'non-existent-id' } } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.getCompanyById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company not found',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const req = { params: { id: 'error-id' } } as unknown as Request;
      const res = createMockResponse();

      const spy = jest
        .spyOn(prisma.company, 'findUnique')
        .mockRejectedValueOnce(new Error('Network error'));

      await CompanyController.getCompanyById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network error',
        })
      );
      spy.mockRestore();
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      await prisma.company.createMany({
        data: [
          { name: 'Company One', description: 'Desc One', isActive: true },
          { name: 'Company Two', description: 'Desc Two', isActive: true },
        ],
      });

      const req = {} as Request;
      const res = createMockResponse();

      await CompanyController.getAllCompanies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
      expect((res.json as jest.Mock).mock.calls[0][0].length).toBe(2);
    });

    it('should return empty array if no companies', async () => {
      const req = {} as Request;
      const res = createMockResponse();

      await CompanyController.getAllCompanies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const req = {} as Request;
      const res = createMockResponse();

      const spy = jest
        .spyOn(prisma.company, 'findMany')
        .mockRejectedValueOnce(new Error('DB error'));

      await CompanyController.getAllCompanies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'DB error',
        })
      );
      spy.mockRestore();
    });
  });

  describe('updateCompany', () => {
    it('should update a company and return 200', async () => {
      const company = await prisma.company.create({
        data: {
          name: 'Original Name',
          description: 'Original description',
          isActive: true,
        },
      });
      const req = {
        params: { id: company.id },
        body: { name: 'Updated Company Name', description: 'New Description' },
      } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.updateCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: company.id,
          name: 'Updated Company Name',
          description: 'New Description',
        })
      );
      const updatedCompany = await prisma.company.findUnique({
        where: { id: company.id },
      });
      expect(updatedCompany?.name).toBe('Updated Company Name');
      expect(updatedCompany?.description).toBe('New Description');
    });

    it('should return 404 if company not found', async () => {
      const req = {
        params: { id: 'non-existent-update-id' },
        body: { name: 'Updated Name' },
      } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.updateCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company not found',
      });
    });

    it('should return 400 for invalid validation data', async () => {
      const company = await prisma.company.create({
        data: {
          name: 'Valid Company',
          description: 'Valid description',
          isActive: true,
        },
      });
      const req = {
        params: { id: company.id },
        body: { name: 123 }, // Invalid data
      } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.updateCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid validation data',
          errors: expect.any(Array),
        })
      );
      const originalCompany = await prisma.company.findUnique({
        where: { id: company.id },
      });
      expect(originalCompany?.name).toBe('Valid Company');
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const company = await prisma.company.create({
        data: {
          name: 'Error Update Company',
          description: 'Error description',
          isActive: true,
        },
      });
      const req = {
        params: { id: company.id },
        body: { name: 'Error Name' },
      } as unknown as Request;
      const res = createMockResponse();

      const spy = jest
        .spyOn(prisma.company, 'update')
        .mockRejectedValueOnce(new Error('Update failed'));

      await CompanyController.updateCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Update failed',
        })
      );
      spy.mockRestore();
    });
  });

  describe('deleteCompany', () => {
    it('should delete a company and return 204', async () => {
      const company = await prisma.company.create({
        data: {
          name: 'Company to Delete',
          description: 'Description to delete',
          isActive: true,
        },
      });
      const req = { params: { id: company.id } } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.deleteCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      const deletedCompany = await prisma.company.findUnique({
        where: { id: company.id },
      });
      expect(deletedCompany).toBeNull();
    });

    it('should return 404 if company not found', async () => {
      const req = {
        params: { id: 'non-existent-delete-id' },
      } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.deleteCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company not found',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const company = await prisma.company.create({
        data: {
          name: 'Error Delete Company',
          description: 'Error description',
          isActive: true,
        },
      });
      const req = { params: { id: company.id } } as unknown as Request;
      const res = createMockResponse();

      const spy = jest
        .spyOn(prisma.company, 'delete')
        .mockRejectedValueOnce(new Error('Delete failed'));

      await CompanyController.deleteCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Delete failed',
        })
      );
      spy.mockRestore();
    });
  });
});
