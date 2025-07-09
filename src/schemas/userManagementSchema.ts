import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z
  .object({
    email: z.string().email('Invalid email').optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const createUserRoleSchema = z.object({
  userId: z
    .string({ required_error: 'User ID is required' })
    .uuid('User ID must be a valid UUID'),
  companyId: z
    .string({ required_error: 'Company ID is required' })
    .uuid('Company ID must be a valid UUID'),
  roleId: z
    .string({ required_error: 'Role ID is required' })
    .uuid('Role ID must be a valid UUID'),
});
