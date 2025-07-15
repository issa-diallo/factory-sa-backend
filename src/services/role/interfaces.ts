import { Role } from '../../generated/prisma';
import { CreateRoleRequest, UpdateRoleRequest } from '../../types/role';

export interface IRoleService {
  createRole(data: CreateRoleRequest): Promise<Role>;
  getRoleById(id: string): Promise<Role | null>;
  getRoleByName(name: string): Promise<Role | null>;
  getAllRoles(): Promise<Role[]>;
  updateRole(id: string, data: UpdateRoleRequest): Promise<Role>;
  deleteRole(id: string): Promise<Role>;
}
