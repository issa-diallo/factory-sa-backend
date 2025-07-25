import { Request, Response } from 'express';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/companySchema';
import { handleError } from '../utils/handleError';
import { mapCompanyError } from '../errors/companyErrorMapper';
import { inject, injectable } from 'tsyringe';
import { ICompanyService } from '../services/company/interfaces';

@injectable()
export class CompanyController {
  constructor(
    @inject('CompanyService') private companyService: ICompanyService
  ) {}
  async createCompany(req: Request, res: Response): Promise<Response> {
    try {
      const data = createCompanySchema.parse(req.body);
      const company = await this.companyService.createCompany(data);
      return res.status(201).json(company);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  async getCompanyById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const company = await this.companyService.getCompanyById(id);

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      return res.status(200).json(company);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  async getAllCompanies(req: Request, res: Response): Promise<Response> {
    try {
      const companies = await this.companyService.getAllCompanies();
      return res.status(200).json(companies);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  async updateCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updateCompanySchema.parse(req.body);

      const existing = await this.companyService.getCompanyById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const updated = await this.companyService.updateCompany(id, data);
      return res.status(200).json(updated);
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }

  async deleteCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const existing = await this.companyService.getCompanyById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Company not found' });
      }

      await this.companyService.deleteCompany(id);
      return res.status(204).send();
    } catch (error: unknown) {
      return handleError(res, mapCompanyError(error));
    }
  }
}
