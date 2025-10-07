import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import {
  requireOwnCompanyOrSystemAdmin,
  validateCompanyAccessInBody,
} from '../../../middlewares/companyAccess';
import {
  validateUserCompanyAccess,
  allowSelfModificationOnly,
  protectSensitiveUserFields,
} from '../../../middlewares/userAccess';
import { UserManagementController } from '../../../controllers/userManagementController';
import { container } from 'tsyringe';

const router: Router = Router();
const userManagementController = container.resolve(UserManagementController);

// User creation with automatic company assignment
router.post(
  '/',
  authenticate,
  authorize(['user:create']),
  userManagementController.createUser
);

// List of users - Filtered by company
router.get(
  '/',
  authenticate,
  authorize(['user:read']),
  requireOwnCompanyOrSystemAdmin(),
  userManagementController.getAllUsers
);

// Profile of the currently logged-in user
router.get(
  '/me',
  authenticate,
  authorize(['user:read']),
  userManagementController.getCurrentUser
);

// Update personal profile (limited fields)
router.put(
  '/me',
  authenticate,
  allowSelfModificationOnly(['firstName', 'lastName', 'email']),
  userManagementController.updateOwnProfile
);

// Change personal password
router.put(
  '/me/password',
  authenticate,
  userManagementController.changeOwnPassword
);

// Roles of a user - Company validation
router.get(
  '/:id/roles',
  authenticate,
  authorize(['user:read']),
  validateUserCompanyAccess(),
  userManagementController.getUserRoles
);

// Available roles for user modification - filtered by user's company
router.get(
  '/:id/available-roles',
  authenticate,
  authorize(['user:read', 'role:read']),
  validateUserCompanyAccess(),
  userManagementController.getAvailableRolesForUser
);

// User by ID - Company validation
router.get(
  '/:id',
  authenticate,
  authorize(['user:read']),
  validateUserCompanyAccess(),
  userManagementController.getUserById
);

// Update user - Company validation + sensitive fields protection
router.put(
  '/:id',
  authenticate,
  authorize(['user:update']),
  validateUserCompanyAccess(),
  protectSensitiveUserFields(),
  userManagementController.updateUser
);

// Delete user - Company validation
router.delete(
  '/:id',
  authenticate,
  authorize(['user:delete']),
  validateUserCompanyAccess(),
  userManagementController.deleteUser
);

// Role management - Company validation
router.post(
  '/user-role',
  authenticate,
  authorize(['userRole:create']),
  validateCompanyAccessInBody(),
  userManagementController.createUserRole
);

router.delete(
  '/user-role/:id',
  authenticate,
  authorize(['userRole:delete']),
  userManagementController.deleteUserRole
);

export default router;
