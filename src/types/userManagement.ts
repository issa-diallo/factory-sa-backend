export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  companyId?: string; // Optionnel - seulement pour System Admin
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface CreateUserRoleRequest {
  userId: string;
  companyId: string;
  roleId: string;
}

export interface UserRoleResponse {
  id: string;
  userId: string;
  companyId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}
