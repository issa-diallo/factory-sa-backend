import { User, UserRole } from '../../generated/prisma';
import {
  CreateUserRequest,
  CreateUserRoleRequest,
  UpdateUserRequest,
} from '../../types/userManagement';

export interface IUserManagementService {
  createUser(data: CreateUserRequest): Promise<Omit<User, 'password'>>;
  getUserById(id: string): Promise<Omit<User, 'password'> | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<Omit<User, 'password'>[]>;
  updateUser(
    id: string,
    data: UpdateUserRequest
  ): Promise<Omit<User, 'password'>>;
  deleteUser(id: string): Promise<User>;

  createUserRole(data: CreateUserRoleRequest): Promise<UserRole>;
  getUserRoleById(id: string): Promise<UserRole | null>;
  getUserRolesByUserId(userId: string): Promise<UserRole[]>;
  getUserRolesByCompanyId(companyId: string): Promise<UserRole[]>;
  getUserRolesByRoleId(roleId: string): Promise<UserRole[]>;
  deleteUserRole(id: string): Promise<UserRole>;
}
