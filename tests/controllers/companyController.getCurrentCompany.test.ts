import { Request, Response } from 'express';
import { CompanyController } from '../../src/controllers/companyController';
import { ICompanyRepository } from '../../src/repositories/company/ICompanyRepository';
import { Company } from '../../src/generated/prisma';
import { TokenPayload } from '../../src/types/auth';

describe('CompanyController - getCurrentCompany', () => {
  let companyController: CompanyController;
  let mockCompanyService: jest.Mocked<ICompanyRepository>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockCompanyService = {
      getCompanyById: jest.fn(),
    } as Partial<
      jest.Mocked<ICompanyRepository>
    > as jest.Mocked<ICompanyRepository>;

    companyController = new CompanyController(mockCompanyService);

    req = {
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 400 if user has no companyId', async () => {
    req.user = {
      userId: 'user-1',
      companyId: undefined,
      roleId: 'role-1',
      roleName: 'USER',
      permissions: ['company:read'],
      isSystemAdmin: false,
    } as Partial<TokenPayload> as TokenPayload;

    await companyController.getCurrentCompany(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User company not found',
    });
    expect(mockCompanyService.getCompanyById).not.toHaveBeenCalled();
  });

  it('should return 404 if company is not found', async () => {
    req.user = {
      userId: 'user-1',
      companyId: 'company-123',
      roleId: 'role-1',
      roleName: 'USER',
      permissions: ['company:read'],
      isSystemAdmin: false,
    } as TokenPayload;

    mockCompanyService.getCompanyById.mockResolvedValue(null);

    await companyController.getCurrentCompany(req as Request, res as Response);

    expect(mockCompanyService.getCompanyById).toHaveBeenCalledWith(
      'company-123'
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Company not found',
    });
  });

  it('should return company data for authenticated user', async () => {
    const mockCompany: Company = {
      id: 'company-123',
      name: 'Test Company',
      description: 'Test Description',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    req.user = {
      userId: 'user-1',
      companyId: 'company-123',
      roleId: 'role-1',
      roleName: 'USER',
      permissions: ['company:read'],
      isSystemAdmin: false,
    } as TokenPayload;

    mockCompanyService.getCompanyById.mockResolvedValue(mockCompany);

    await companyController.getCurrentCompany(req as Request, res as Response);

    expect(mockCompanyService.getCompanyById).toHaveBeenCalledWith(
      'company-123'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCompany);
  });

  it('should work for System Admin', async () => {
    const mockCompany: Company = {
      id: 'company-456',
      name: 'Admin Company',
      description: 'Admin Description',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    req.user = {
      userId: 'admin-1',
      companyId: 'company-456',
      roleId: 'role-admin',
      roleName: 'ADMIN',
      permissions: ['company:read', 'company:create'],
      isSystemAdmin: true,
    } as TokenPayload;

    mockCompanyService.getCompanyById.mockResolvedValue(mockCompany);

    await companyController.getCurrentCompany(req as Request, res as Response);

    expect(mockCompanyService.getCompanyById).toHaveBeenCalledWith(
      'company-456'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCompany);
  });

  it('should work for Manager', async () => {
    const mockCompany: Company = {
      id: 'company-789',
      name: 'Manager Company',
      description: 'Manager Description',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    req.user = {
      userId: 'manager-1',
      companyId: 'company-789',
      roleId: 'role-manager',
      roleName: 'MANAGER',
      permissions: ['company:read', 'user:manage'],
      isSystemAdmin: false,
    } as TokenPayload;

    mockCompanyService.getCompanyById.mockResolvedValue(mockCompany);

    await companyController.getCurrentCompany(req as Request, res as Response);

    expect(mockCompanyService.getCompanyById).toHaveBeenCalledWith(
      'company-789'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCompany);
  });
});
