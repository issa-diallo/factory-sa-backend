import { Request, Response } from 'express';
import {
  createCompanyDomainSchema,
  createDomainSchema,
  updateDomainSchema,
} from '../schemas/domainSchema';
import { mapDomainError } from '../errors/domainErrorMapper';
import { inject, injectable } from 'tsyringe';
import { IDomainService } from '../services/domain/interfaces';
import { BaseController } from './baseController';

@injectable()
export class DomainController extends BaseController {
  constructor(@inject('DomainService') private domainService: IDomainService) {
    super();
  }
  createDomain = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = createDomainSchema.parse(req.body);
      const domain = await this.domainService.createDomain(data);
      return res.status(201).json(domain);
    } catch (error: unknown) {
      return this.handleError(res, error, mapDomainError);
    }
  };

  getDomainById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const domain = await this.domainService.getDomainById(id);
      return res.status(200).json(domain);
    } catch (error) {
      return this.handleError(res, error, mapDomainError);
    }
  };

  getAllDomains = async (req: Request, res: Response): Promise<Response> => {
    try {
      const domains = await this.domainService.getAllDomains();
      return res.status(200).json(domains);
    } catch (error) {
      return this.handleError(res, error, mapDomainError);
    }
  };

  updateDomain = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const data = updateDomainSchema.parse(req.body);
      const updatedDomain = await this.domainService.updateDomain(id, data);
      return res.status(200).json(updatedDomain);
    } catch (error: unknown) {
      return this.handleError(res, error, mapDomainError);
    }
  };

  deleteDomain = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.domainService.deleteDomain(id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error, mapDomainError);
    }
  };

  createCompanyDomain = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const data = createCompanyDomainSchema.parse(req.body);
      const companyDomain = await this.domainService.createCompanyDomain(data);
      return res.status(201).json(companyDomain);
    } catch (error: unknown) {
      return this.handleError(res, error, mapDomainError);
    }
  };

  deleteCompanyDomain = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { companyId, domainId } = req.params;
      await this.domainService.deleteCompanyDomain(companyId, domainId);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error, mapDomainError);
    }
  };
}
