import { z } from 'zod';

export const createDomainSchema = z.object({
  name: z.string().min(1, 'Domain name is required'),
  isActive: z.boolean().optional().default(true),
});

export const updateDomainSchema = z
  .object({
    name: z.string().min(1, 'Domain name is required').optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const createCompanyDomainSchema = z.object({
  companyId: z.string().uuid('Company ID must be a valid UUID'),
  domainId: z.string().uuid('Domain ID must be a valid UUID'),
});
