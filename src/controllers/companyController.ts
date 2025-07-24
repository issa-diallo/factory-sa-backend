import { Request, Response } from 'express';
import { CompanyService } from '../services/company/companyService';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/companySchema';
import { handleError } from '../utils/handleError';
import { mapCompanyError } from '../errors/companyErrorMapper';

const companyService = new CompanyService();

export class CompanyController {
  static async createCompany(req: Request, res: Response): Promise<Response> {
    try {
      const data = createCompanySchema.parse(req.body);
      const company = await companyService.createCompany(data);
      return res.status(201).json(company);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  static async getCompanyById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const company = await companyService.getCompanyById(id);

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      return res.status(200).json(company);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  static async getAllCompanies(req: Request, res: Response): Promise<Response> {
    try {
      const companies = await companyService.getAllCompanies();
      return res.status(200).json(companies);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  static async updateCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updateCompanySchema.parse(req.body);

      const existing = await companyService.getCompanyById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const updated = await companyService.updateCompany(id, data);
      return res.status(200).json(updated);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  static async deleteCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const existing = await companyService.getCompanyById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Company not found' });
      }

      await companyService.deleteCompany(id);
      return res.status(204).send();
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }
}
