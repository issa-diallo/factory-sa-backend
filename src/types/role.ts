export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}
