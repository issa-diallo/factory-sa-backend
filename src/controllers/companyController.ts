import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { CompanyService } from '../services/company/companyService';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/companySchema';

const companyService = new CompanyService();

export class CompanyController {
  static async createCompany(req: Request, res: Response): Promise<Response> {
    try {
      const data = createCompanySchema.parse(req.body);
      const company = await companyService.createCompany(data);
      return res.status(201).json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.issues,
        });
      }
      return res.status(500).json({ message: (error as Error).message });
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
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getAllCompanies(req: Request, res: Response): Promise<Response> {
    try {
      const companies = await companyService.getAllCompanies();
      return res.status(200).json(companies);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
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
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.issues,
        });
      }
      return res.status(500).json({ message: (error as Error).message });
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
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }
}
