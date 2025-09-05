import { CompanyService } from '../../src/services/company/companyService';
import { ICompanyRepository } from '../../src/repositories/company/ICompanyRepository';
import { Company } from '../../src/generated/prisma';

describe('CompanyService - Filtering', () => {
  let companyService: CompanyService;
  let mockCompanyRepository: jest.Mocked<ICompanyRepository>;

  beforeEach(() => {
    mockCompanyRepository = {
      create: jest.fn(),
      getCompanyById: jest.fn(),
      getCompanyByName: jest.fn(),
      getAllCompanies: jest.fn(),
      updateCompany: jest.fn(),
      deleteCompany: jest.fn(),
      getCompaniesByUser: jest.fn(),
      canUserAccessCompany: jest.fn(),
    } as Partial<
      jest.Mocked<ICompanyRepository>
    > as jest.Mocked<ICompanyRepository>;

    companyService = new CompanyService(mockCompanyRepository);
  });

  describe('getAllCompanies with filtering', () => {
    const mockCompanies: Company[] = [
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

    it('should return all companies when no filter is provided (System Admin)', async () => {
      mockCompanyRepository.getAllCompanies.mockResolvedValue(mockCompanies);

      const result = await companyService.getAllCompanies();

      expect(mockCompanyRepository.getAllCompanies).toHaveBeenCalledWith(
        undefined
      );
      expect(result).toEqual(mockCompanies);
    });

    it('should return filtered companies when companyFilter is provided', async () => {
      const filteredCompany = [mockCompanies[0]];
      const filter = { companyId: 'company-1' };

      mockCompanyRepository.getAllCompanies.mockResolvedValue(filteredCompany);

      const result = await companyService.getAllCompanies(filter);

      expect(mockCompanyRepository.getAllCompanies).toHaveBeenCalledWith(
        filter
      );
      expect(result).toEqual(filteredCompany);
    });

    it('should return empty array when filtered company does not exist', async () => {
      const filter = { companyId: 'non-existent-company' };

      mockCompanyRepository.getAllCompanies.mockResolvedValue([]);

      const result = await companyService.getAllCompanies(filter);

      expect(mockCompanyRepository.getAllCompanies).toHaveBeenCalledWith(
        filter
      );
      expect(result).toEqual([]);
    });
  });

  describe('getCompaniesByUser', () => {
    const mockUserCompany: Company = {
      id: 'user-company-1',
      name: 'User Company',
      description: 'User Company Description',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAllCompanies: Company[] = [
      mockUserCompany,
      {
        id: 'other-company-1',
        name: 'Other Company',
        description: 'Other Company Description',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all companies for System Admin', async () => {
      mockCompanyRepository.getCompaniesByUser.mockResolvedValue(
        mockAllCompanies
      );

      const result = await companyService.getCompaniesByUser(
        'admin-user-id',
        true
      );

      expect(mockCompanyRepository.getCompaniesByUser).toHaveBeenCalledWith(
        'admin-user-id',
        true
      );
      expect(result).toEqual(mockAllCompanies);
    });

    it('should return only user company for normal user', async () => {
      mockCompanyRepository.getCompaniesByUser.mockResolvedValue([
        mockUserCompany,
      ]);

      const result = await companyService.getCompaniesByUser(
        'normal-user-id',
        false
      );

      expect(mockCompanyRepository.getCompaniesByUser).toHaveBeenCalledWith(
        'normal-user-id',
        false
      );
      expect(result).toEqual([mockUserCompany]);
    });

    it('should return empty array if user has no company', async () => {
      mockCompanyRepository.getCompaniesByUser.mockResolvedValue([]);

      const result = await companyService.getCompaniesByUser(
        'orphan-user-id',
        false
      );

      expect(mockCompanyRepository.getCompaniesByUser).toHaveBeenCalledWith(
        'orphan-user-id',
        false
      );
      expect(result).toEqual([]);
    });
  });

  describe('canUserAccessCompany', () => {
    it('should return true for System Admin accessing any company', async () => {
      mockCompanyRepository.canUserAccessCompany.mockResolvedValue(true);

      const result = await companyService.canUserAccessCompany(
        'any-company-id',
        'admin-user-id',
        true
      );

      expect(mockCompanyRepository.canUserAccessCompany).toHaveBeenCalledWith(
        'any-company-id',
        'admin-user-id',
        true
      );
      expect(result).toBe(true);
    });

    it('should return true for user accessing their own company', async () => {
      mockCompanyRepository.canUserAccessCompany.mockResolvedValue(true);

      const result = await companyService.canUserAccessCompany(
        'user-company-id',
        'user-id',
        false
      );

      expect(mockCompanyRepository.canUserAccessCompany).toHaveBeenCalledWith(
        'user-company-id',
        'user-id',
        false
      );
      expect(result).toBe(true);
    });

    it('should return false for user accessing other company', async () => {
      mockCompanyRepository.canUserAccessCompany.mockResolvedValue(false);

      const result = await companyService.canUserAccessCompany(
        'other-company-id',
        'user-id',
        false
      );

      expect(mockCompanyRepository.canUserAccessCompany).toHaveBeenCalledWith(
        'other-company-id',
        'user-id',
        false
      );
      expect(result).toBe(false);
    });
  });
});
