import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../database/prismaClient';
import { CompanyService } from '../services/company/companyService';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/companySchema';

const companyService = new CompanyService(prisma);

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
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
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
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getAllCompanies(req: Request, res: Response): Promise<Response> {
    try {
      const companies = await companyService.getAllCompanies();
      return res.status(200).json(companies);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async updateCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updateCompanySchema.parse(req.body);

      const existingCompany = await companyService.getCompanyById(id);
      if (!existingCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const updatedCompany = await companyService.updateCompany(id, data);
      return res.status(200).json(updatedCompany);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.errors,
        });
      }
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async deleteCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingCompany = await companyService.getCompanyById(id);
      if (!existingCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }

      await companyService.deleteCompany(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }
}
