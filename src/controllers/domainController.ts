import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { DomainService } from '../services/domain/domainService';
import {
  createCompanyDomainSchema,
  createDomainSchema,
  updateDomainSchema,
} from '../schemas/domainSchema';
import { mapDomainError } from '../errors/domainErrorMapper';
import { handleError } from '../utils/handleError';

const domainService = new DomainService(prisma);

export class DomainController {
  static async createDomain(req: Request, res: Response): Promise<Response> {
    try {
      const data = createDomainSchema.parse(req.body);
      const domain = await domainService.createDomain(data);
      return res.status(201).json(domain);
    } catch (error: unknown) {
      return handleError(res, mapDomainError(error));
    }
  }

  static async getDomainById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const domain = await domainService.getDomainById(id);
      return res.status(200).json(domain);
    } catch (error) {
      return handleError(res, mapDomainError(error));
    }
  }

  static async getAllDomains(req: Request, res: Response): Promise<Response> {
    try {
      const domains = await domainService.getAllDomains();
      return res.status(200).json(domains);
    } catch (error) {
      return handleError(res, mapDomainError(error));
    }
  }

  static async updateDomain(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updateDomainSchema.parse(req.body);
      const updatedDomain = await domainService.updateDomain(id, data);
      return res.status(200).json(updatedDomain);
    } catch (error: unknown) {
      return handleError(res, mapDomainError(error));
    }
  }

  static async deleteDomain(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await domainService.deleteDomain(id);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, mapDomainError(error));
    }
  }

  static async createCompanyDomain(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const data = createCompanyDomainSchema.parse(req.body);
      const companyDomain = await domainService.createCompanyDomain(data);
      return res.status(201).json(companyDomain);
    } catch (error: unknown) {
      return handleError(res, mapDomainError(error));
    }
  }

  static async deleteCompanyDomain(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      await domainService.deleteCompanyDomain(id);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, mapDomainError(error));
    }
  }
}
