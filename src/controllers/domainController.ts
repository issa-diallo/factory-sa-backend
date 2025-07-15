import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../database/prismaClient';
import { DomainService } from '../services/domain/domainService';
import {
  createCompanyDomainSchema,
  createDomainSchema,
  updateDomainSchema,
} from '../schemas/domainSchema';

const domainService = new DomainService(prisma);

export class DomainController {
  static async createDomain(req: Request, res: Response): Promise<Response> {
    try {
      const data = createDomainSchema.parse(req.body);
      const domain = await domainService.createDomain(data);
      return res.status(201).json(domain);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.issues,
        });
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        return res
          .status(409)
          .json({ message: 'Domain with this name already exists.' });
      }
      const appError =
        error instanceof Error ? error : new Error('An unknown error occurred');
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getDomainById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const domain = await domainService.getDomainById(id);

      if (!domain) {
        return res.status(404).json({ message: 'Domain not found' });
      }

      return res.status(200).json(domain);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async getAllDomains(req: Request, res: Response): Promise<Response> {
    try {
      const domains = await domainService.getAllDomains();
      return res.status(200).json(domains);
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }

  static async updateDomain(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = updateDomainSchema.parse(req.body);

      const existingDomain = await domainService.getDomainById(id);
      if (!existingDomain) {
        return res.status(404).json({ message: 'Domain not found' });
      }

      const updatedDomain = await domainService.updateDomain(id, data);
      return res.status(200).json(updatedDomain);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.issues,
        });
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        return res
          .status(409)
          .json({ message: 'Domain with this name already exists.' });
      }
      const appError =
        error instanceof Error ? error : new Error('An unknown error occurred');
      return res.status(500).json({ message: appError.message });
    }
  }

  static async deleteDomain(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingDomain = await domainService.getDomainById(id);
      if (!existingDomain) {
        return res.status(404).json({ message: 'Domain not found' });
      }

      await domainService.deleteDomain(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
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
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid validation data',
          errors: error.issues,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isUniqueConstraintError = (error as any)?.code === 'P2002';
      if (isUniqueConstraintError) {
        return res.status(409).json({
          message:
            'Unique constraint failed on the fields: (`companyId`,`domainId`)',
        });
      }

      // Default error handling
      const appError =
        error instanceof Error ? error : new Error('An unknown error occurred');
      return res.status(500).json({ message: appError.message });
    }
  }

  static async deleteCompanyDomain(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      const existingCompanyDomain =
        await domainService.getCompanyDomainById(id);
      if (!existingCompanyDomain) {
        return res.status(404).json({ message: 'Company domain not found' });
      }

      await domainService.deleteCompanyDomain(id);
      return res.status(204).send();
    } catch (error) {
      const appError = error as Error;
      return res.status(500).json({ message: appError.message });
    }
  }
}
