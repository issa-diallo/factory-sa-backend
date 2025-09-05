import { Request, Response } from 'express';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/companySchema';
import { mapCompanyError } from '../errors/companyErrorMapper';
import { inject, injectable } from 'tsyringe';
import { ICompanyRepository } from '../repositories/company/ICompanyRepository';
import { BaseController } from './baseController';

@injectable()
export class CompanyController extends BaseController {
  constructor(
    @inject('CompanyService') private companyService: ICompanyRepository
  ) {
    super();
  }
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = createCompanySchema.parse(req.body);
      const company = await this.companyService.create(data);
      return res.status(201).json(company);
    } catch (error: unknown) {
      return this.handleError(res, error, mapCompanyError);
    }
  };

  getCompanyById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const company = await this.companyService.getCompanyById(id);

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      return res.status(200).json(company);
    } catch (error: unknown) {
      return this.handleError(res, error, mapCompanyError);
    }
  };

  getAllCompanies = async (req: Request, res: Response): Promise<Response> => {
    try {
      const companies = await this.companyService.getAllCompanies(
        req.companyFilter
      );
      return res.status(200).json(companies);
    } catch (error: unknown) {
      return this.handleError(res, error, mapCompanyError);
    }
  };

  getCurrentCompany = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user?.companyId) {
        return res.status(400).json({ message: 'User company not found' });
      }

      const company = await this.companyService.getCompanyById(
        req.user.companyId
      );

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      return res.status(200).json(company);
    } catch (error: unknown) {
      return this.handleError(res, error, mapCompanyError);
    }
  };

  updateCompany = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, error, mapCompanyError);
    }
  };

  deleteCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const existing = await this.companyService.getCompanyById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Company not found' });
      }

      await this.companyService.deleteCompany(id);
      return res.status(204).send();
    } catch (error: unknown) {
      return this.handleError(res, error, mapCompanyError);
    }
  };
}
