import { Request, Response } from 'express';
import { CompanyController } from '../../src/controllers/companyController';
import { TokenPayload } from '../../src/types/auth';
import { ICompanyRepository } from '../../src/repositories/company/ICompanyRepository';

describe('Company Filtering Integration', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockCompanyService: jest.Mocked<ICompanyRepository>;
  let companyController: CompanyController;

  beforeEach(() => {
    mockCompanyService = {
      getAllCompanies: jest.fn(),
      getCompanyById: jest.fn(),
      create: jest.fn(),
      updateCompany: jest.fn(),
      deleteCompany: jest.fn(),
      getCompanyByName: jest.fn(),
      getCompaniesByUser: jest.fn(),
      canUserAccessCompany: jest.fn(),
    };

    companyController = new CompanyController(mockCompanyService);

    req = {
      user: undefined,
      companyFilter: undefined,
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAllCompanies with filtering', () => {
    it('should call service with no filter for System Admin', async () => {
      // System Admin user
      req.user = {
        userId: 'admin-1',
        companyId: 'admin-company',
        roleId: 'role-admin',
        roleName: 'ADMIN',
        permissions: ['company:read'],
        isSystemAdmin: true,
      } as TokenPayload;

      // No companyFilter set (System Admin bypass)
      req.companyFilter = undefined;

      const mockCompanies = [
        {
          id: 'company-1',
          name: 'Company 1',
          description: 'Description 1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'company-2',
          name: 'Company 2',
          description: 'Description 2',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCompanyService.getAllCompanies.mockResolvedValue(mockCompanies);

      await companyController.getAllCompanies(req as Request, res as Response);

      expect(mockCompanyService.getAllCompanies).toHaveBeenCalledWith(
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCompanies);
    });

    it('should call service with companyFilter for normal user', async () => {
      // Normal user
      req.user = {
        userId: 'user-1',
        companyId: 'user-company-123',
        roleId: 'role-user',
        roleName: 'USER',
        permissions: ['company:read'],
        isSystemAdmin: false,
      } as TokenPayload;

      // companyFilter set by middleware
      req.companyFilter = { companyId: 'user-company-123' };

      const mockUserCompany = [
        {
          id: 'user-company-123',
          name: 'User Company',
          description: 'User Company Description',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCompanyService.getAllCompanies.mockResolvedValue(mockUserCompany);

      await companyController.getAllCompanies(req as Request, res as Response);

      expect(mockCompanyService.getAllCompanies).toHaveBeenCalledWith({
        companyId: 'user-company-123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserCompany);
    });

    it('should call service with companyFilter for manager', async () => {
      // Manager user
      req.user = {
        userId: 'manager-1',
        companyId: 'manager-company-456',
        roleId: 'role-manager',
        roleName: 'MANAGER',
        permissions: ['company:read', 'user:manage'],
        isSystemAdmin: false,
      } as TokenPayload;

      // companyFilter set by middleware
      req.companyFilter = { companyId: 'manager-company-456' };

      const mockManagerCompany = [
        {
          id: 'manager-company-456',
          name: 'Manager Company',
          description: 'Manager Company Description',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCompanyService.getAllCompanies.mockResolvedValue(mockManagerCompany);

      await companyController.getAllCompanies(req as Request, res as Response);

      expect(mockCompanyService.getAllCompanies).toHaveBeenCalledWith({
        companyId: 'manager-company-456',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockManagerCompany);
    });
  });

  describe('Filtering behavior demonstration', () => {
    it('should demonstrate the complete filtering flow', async () => {
      // Simuler le comportement complet du middleware + contrôleur

      // Cas 1: System Admin - Pas de filtrage
      const adminRequest = {
        user: {
          userId: 'admin-1',
          companyId: 'admin-company',
          roleName: 'ADMIN',
          isSystemAdmin: true,
        } as TokenPayload,
        companyFilter: undefined, // Pas de filtrage pour les admins
      } as Request;

      const allCompanies = [
        {
          id: 'company-1',
          name: 'Company 1',
          description: 'Description 1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'company-2',
          name: 'Company 2',
          description: 'Description 2',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'company-3',
          name: 'Company 3',
          description: 'Description 3',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCompanyService.getAllCompanies.mockResolvedValueOnce(allCompanies);

      await companyController.getAllCompanies(adminRequest, res as Response);

      expect(mockCompanyService.getAllCompanies).toHaveBeenCalledWith(
        undefined
      );
      expect(res.json).toHaveBeenCalledWith(allCompanies);

      // Reset mocks
      jest.clearAllMocks();

      // Cas 2: Utilisateur normal - Filtrage par entreprise
      const userRequest = {
        user: {
          userId: 'user-1',
          companyId: 'company-2',
          roleName: 'USER',
          isSystemAdmin: false,
        } as TokenPayload,
        companyFilter: { companyId: 'company-2' }, // Filtrage par middleware
      } as Request;

      const userCompany = [
        {
          id: 'company-2',
          name: 'Company 2',
          description: 'Description 2',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCompanyService.getAllCompanies.mockResolvedValueOnce(userCompany);

      await companyController.getAllCompanies(userRequest, res as Response);

      expect(mockCompanyService.getAllCompanies).toHaveBeenCalledWith({
        companyId: 'company-2',
      });
      expect(res.json).toHaveBeenCalledWith(userCompany);
    });
  });
});
