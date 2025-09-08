import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleId: z
    .string()
    .min(1, 'Role ID is required')
    .uuid('Role ID must be a valid UUID'),
  companyId: z.string().uuid('Company ID must be a valid UUID').optional(), // Optional - only for System Admin
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
    .string()
    .min(1, 'User ID is required')
    .uuid('User ID must be a valid UUID'),
  companyId: z
    .string()
    .min(1, 'Company ID is required')
    .uuid('Company ID must be a valid UUID'),
  roleId: z
    .string()
    .min(1, 'Role ID is required')
    .uuid('Role ID must be a valid UUID'),
});

// Schema for self-modification (limited fields)
export const updateOwnProfileSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Invalid email').optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// Schema for password change
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long'),
});
