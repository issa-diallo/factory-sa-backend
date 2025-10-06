import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  companyId: z.string().uuid('Company ID must be a valid UUID').optional(),
});

export const updateRoleSchema = z
  .object({
    name: z.string().min(1, 'Role name is required').optional(),
    description: z.string().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
