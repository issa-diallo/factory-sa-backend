import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ICompanyDomainRepository } from '../repositories/companyDomain/ICompanyDomainRepository';
import { ForbiddenError } from '../errors/customErrors';

/**
 * Middleware to validate access to a specific domain
 * Checks that the domain belongs to the user's company
 * or that the user is a System Admin
 */
export const validateDomainCompanyAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: domainId } = req.params;

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // System Admins have access to all domains
      if (isSystemAdmin) {
        return next();
      }

      // Validate that the domain belongs to the user's company
      const companyDomainRepository =
        container.resolve<ICompanyDomainRepository>('ICompanyDomainRepository');

      const companyDomain =
        await companyDomainRepository.findByDomainIdWithCompany(domainId);

      if (!companyDomain) {
        throw new ForbiddenError('Domain not found or access denied');
      }

      // Check that the domain's company is active and matches the user's company
      if (
        !companyDomain.company.isActive ||
        companyDomain.companyId !== companyId
      ) {
        throw new ForbiddenError('Access to domain denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate access to domains via the request body
 * Checks that the domains in the body belong to the user's company
 */
export const validateDomainCompanyAccessInBody = (
  domainIdField: string = 'domainId'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const domainId = req.body[domainIdField];

      if (!domainId) {
        return next(); // No domain to validate
      }

      // Check if the user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const { companyId, isSystemAdmin } = req.user;

      // System Admins have access to all domains
      if (isSystemAdmin) {
        return next();
      }

      // Validate that the domain belongs to the user's company
      const companyDomainRepository =
        container.resolve<ICompanyDomainRepository>('ICompanyDomainRepository');

      const companyDomain =
        await companyDomainRepository.findByDomainIdWithCompany(domainId);

      if (!companyDomain) {
        throw new ForbiddenError('Domain not found or access denied');
      }

      // Check that the domain's company is active and matches the user's company
      if (
        !companyDomain.company.isActive ||
        companyDomain.companyId !== companyId
      ) {
        throw new ForbiddenError('Access to domain denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
