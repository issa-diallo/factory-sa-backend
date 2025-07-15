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

describe('CompanyController (static)', () => {
  beforeEach(async () => {
    // Rendre beforeEach asynchrone
    jest.clearAllMocks();

    // Nettoyage des tables avant chaque test
    await prisma.userRole.deleteMany();
    await prisma.companyDomain.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.session.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createCompany', () => {
    it('should create a company and return 201 status', async () => {
      const req = {
        body: {
          name: 'New Company',
          description: 'New Desc',
          isActive: true,
        },
      } as unknown as Request;
      const res = createMockResponse();

      // Pas de mock pour les tests d'intégration

      await CompanyController.createCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String), // L'ID est généré par Prisma
          name: 'New Company',
        })
      );
    });

    it('should return 400 for invalid validation data', async () => {
      const req = { body: { name: 123 } } as unknown as Request;
      const res = createMockResponse();

      await CompanyController.createCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid validation data',
          errors: expect.any(Array),
        })
      );
    });

    it('should return 500 for internal server error', async () => {
      const req = {
        body: {
          name: 'Company',
          description: 'Error test',
          isActive: true,
        },
      } as unknown as Request;
      const res = createMockResponse();

      // Provoquer une erreur de base de données (violation de contrainte d'unicité)
      await prisma.company.create({
        data: {
          name: req.body.name, // Créer une compagnie avec le même nom
          description: 'Existing Desc',
          isActive: true,
        },
      });

      await CompanyController.createCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            'Unique constraint failed on the fields: (`name`)'
          ),
        })
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return 200 and company if found', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = createMockResponse();
      // Création d'une compagnie réelle pour le test
      await prisma.company.create({
        data: {
          id: '1',
          name: 'Test Company',
          description: 'Test Description',
          isActive: true,
        },
      });

      await CompanyController.getCompanyById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' })
      );
    });

    it('should return 404 if not found', async () => {
      const req = { params: { id: '404' } } as unknown as Request;
      const res = createMockResponse();
      // Pas de mock pour les tests d'intégration

      await CompanyController.getCompanyById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const req = {} as Request;
      const res = createMockResponse();
      const companies = [
        {
          id: '1',
          name: 'Test',
          description: 'Test Description',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Création de compagnies réelles pour le test
      await prisma.company.createMany({
        data: companies,
      });

      await CompanyController.getAllCompanies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(companies);
    });

    it('should return empty array and 200 status if no companies', async () => {
      const req = {} as Request;
      const res = createMockResponse();
      // Pas de mock pour les tests d'intégration

      await CompanyController.getAllCompanies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('updateCompany', () => {
    it('should update and return 200', async () => {
      const req = {
        params: { id: '1' },
        body: { name: 'Updated' },
      } as unknown as Request;
      const res = createMockResponse();
      // Création d'une compagnie réelle pour le test
      await prisma.company.create({
        data: {
          id: '1',
          name: 'Old Company',
          description: 'Old Description',
          isActive: true,
        },
      });

      await CompanyController.updateCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated' })
      );
    });

    it('should return 404 if not found', async () => {
      const req = {
        params: { id: '1' },
        body: { name: 'Updated' },
      } as unknown as Request;
      const res = createMockResponse();
      // Pas de mock pour les tests d'intégration

      await CompanyController.updateCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteCompany', () => {
    it('should delete and return 204', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = createMockResponse();
      // Création d'une compagnie réelle pour le test
      await prisma.company.create({
        data: {
          id: '1',
          name: 'Test Company',
          description: 'Test Description',
          isActive: true,
        },
      });

      await CompanyController.deleteCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      const req = { params: { id: '404' } } as unknown as Request;
      const res = createMockResponse();
      // Pas de mock pour les tests d'intégration

      await CompanyController.deleteCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
