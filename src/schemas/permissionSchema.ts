import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
});

export const updatePermissionSchema = z
  .object({
    name: z.string().min(1, 'Permission name is required').optional(),
    description: z.string().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const createRolePermissionSchema = z.object({
  roleId: z.string().uuid('Role ID must be a valid UUID'),
  permissionId: z.string().uuid('Permission ID must be a valid UUID'),
});
