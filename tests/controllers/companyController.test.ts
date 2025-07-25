// tests/controllers/companyController.test.ts
import { Request, Response } from 'express';
import { CompanyController } from '../../src/controllers/companyController';
import { ICompanyService } from '../../src/services/company/interfaces';
import { Company } from '../../src/generated/prisma';
import { generateValidCompany } from '../fixtures/company/generateCompanyFixtures';

function createMockResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;
}

describe('CompanyController with mocked service', () => {
  let mockService: jest.Mocked<ICompanyService>;
  let controller: CompanyController;
  let res: Response;

  beforeEach(() => {
    mockService = {
      createCompany: jest.fn(),
      getCompanyById: jest.fn(),
      getAllCompanies: jest.fn(),
      updateCompany: jest.fn(),
      deleteCompany: jest.fn(),
      getCompanyByName: jest.fn(),
    };
    controller = new CompanyController(mockService);
    res = createMockResponse();
  });

  describe('createCompany', () => {
    it('should create a company and return 201 status', async () => {
      const newCompany = generateValidCompany()[0];
      const req = { body: newCompany } as Request;
      mockService.createCompany.mockResolvedValueOnce({
        id: 'company-id-1',
        ...newCompany,
      } as Company);

      await controller.createCompany(req, res);

      expect(mockService.createCompany).toHaveBeenCalledWith(newCompany);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'company-id-1', name: newCompany.name })
      );
    });

    it('should return 400 for invalid validation data', async () => {
      const req = { body: { name: 123 } } as unknown as Request; // Invalid data
      await controller.createCompany(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid validation data' })
      );
    });

    it('should return 409 if company name already exists', async () => {
      const existingCompany = generateValidCompany()[0];
      const req = { body: existingCompany } as Request;
      mockService.createCompany.mockRejectedValueOnce({
        code: 'P2002', // Prisma error code for unique constraint violation
        meta: { target: ['name'] },
      });

      await controller.createCompany(req, res);

      expect(mockService.createCompany).toHaveBeenCalledWith(existingCompany);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company with this name already exists.',
        })
      );
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const newCompany = generateValidCompany()[0];
      const req = { body: newCompany } as Request;
      mockService.createCompany.mockRejectedValueOnce(
        new Error('Something went wrong')
      );

      await controller.createCompany(req, res);

      expect(mockService.createCompany).toHaveBeenCalledWith(newCompany);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Something went wrong' })
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return 200 and company if found', async () => {
      const companyId = 'company-id-get';
      const foundCompany = {
        id: companyId,
        ...generateValidCompany()[0],
      } as Company;
      const req = { params: { id: companyId } } as unknown as Request;
      mockService.getCompanyById.mockResolvedValueOnce(foundCompany);

      await controller.getCompanyById(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(foundCompany)
      );
    });

    it('should return 404 if company not found', async () => {
      const companyId = 'non-existent-id';
      const req = { params: { id: companyId } } as unknown as Request;
      mockService.getCompanyById.mockResolvedValueOnce(null);

      await controller.getCompanyById(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company not found',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const companyId = 'error-id';
      const req = { params: { id: companyId } } as unknown as Request;
      mockService.getCompanyById.mockRejectedValueOnce(
        new Error('Database error')
      );

      await controller.getCompanyById(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Database error' })
      );
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const companies = generateValidCompany(2).map((c, i) => ({
        id: `company-id-${i + 1}`,
        ...c,
      })) as Company[];
      const req = {} as Request;
      mockService.getAllCompanies.mockResolvedValueOnce(companies);

      await controller.getAllCompanies(req, res);

      expect(mockService.getAllCompanies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(companies));
      expect((res.json as jest.Mock).mock.calls[0][0].length).toBe(2);
    });

    it('should return empty array if no companies', async () => {
      const req = {} as Request;
      mockService.getAllCompanies.mockResolvedValueOnce([]);

      await controller.getAllCompanies(req, res);

      expect(mockService.getAllCompanies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const req = {} as Request;
      mockService.getAllCompanies.mockRejectedValueOnce(
        new Error('Network error')
      );

      await controller.getAllCompanies(req, res);

      expect(mockService.getAllCompanies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Network error' })
      );
    });
  });

  describe('updateCompany', () => {
    it('should update a company and return 200', async () => {
      const companyId = 'company-id-update';
      const updatedData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };
      const existingCompany = {
        id: companyId,
        ...generateValidCompany()[0],
      } as Company;
      const updatedCompany = { ...existingCompany, ...updatedData } as Company;

      const req = {
        params: { id: companyId },
        body: updatedData,
      } as unknown as Request;
      mockService.getCompanyById.mockResolvedValueOnce(existingCompany);
      mockService.updateCompany.mockResolvedValueOnce(updatedCompany);

      await controller.updateCompany(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(mockService.updateCompany).toHaveBeenCalledWith(
        companyId,
        updatedData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(updatedCompany)
      );
    });

    it('should return 404 if company not found', async () => {
      const companyId = 'non-existent-update-id';
      const req = {
        params: { id: companyId },
        body: { name: 'New Name' },
      } as unknown as Request;
      mockService.getCompanyById.mockResolvedValueOnce(null);

      await controller.updateCompany(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(mockService.updateCompany).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company not found',
      });
    });

    it('should return 400 for invalid validation data', async () => {
      const companyId = 'company-id-invalid-update';
      const req = {
        params: { id: companyId },
        body: { name: 123 },
      } as unknown as Request; // Invalid data
      await controller.updateCompany(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid validation data' })
      );
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const companyId = 'error-update-id';
      const updatedData = { name: 'Updated Name' };
      const existingCompany = {
        id: companyId,
        ...generateValidCompany()[0],
      } as Company;

      const req = {
        params: { id: companyId },
        body: updatedData,
      } as unknown as Request;
      mockService.getCompanyById.mockResolvedValueOnce(existingCompany);
      mockService.updateCompany.mockRejectedValueOnce(
        new Error('Update failed')
      );

      await controller.updateCompany(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(mockService.updateCompany).toHaveBeenCalledWith(
        companyId,
        updatedData
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Update failed' })
      );
    });
  });

  describe('deleteCompany', () => {
    it('should delete a company and return 204', async () => {
      const companyId = 'company-id-delete';
      const req = { params: { id: companyId } } as unknown as Request;
      const deletedCompany = {
        id: companyId,
        ...generateValidCompany()[0],
      } as Company;
      mockService.getCompanyById.mockResolvedValueOnce(deletedCompany);
      mockService.deleteCompany.mockResolvedValueOnce(deletedCompany);

      await controller.deleteCompany(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(mockService.deleteCompany).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if company not found', async () => {
      const companyId = 'non-existent-delete-id';
      const req = { params: { id: companyId } } as unknown as Request;
      mockService.getCompanyById.mockResolvedValueOnce(null);

      await controller.deleteCompany(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(mockService.deleteCompany).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company not found',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const companyId = 'error-delete-id';
      const req = { params: { id: companyId } } as unknown as Request;
      mockService.getCompanyById.mockResolvedValueOnce({
        id: companyId,
      } as Company);
      mockService.deleteCompany.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      await controller.deleteCompany(req, res);

      expect(mockService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(mockService.deleteCompany).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Delete failed' })
      );
    });
  });
});
