export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
}

export interface CreateRolePermissionRequest {
  roleId: string;
  permissionId: string;
}

export interface RolePermissionResponse {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: Date;
  updatedAt: Date;
}
