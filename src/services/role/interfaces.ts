import { Role } from '../../generated/prisma';
import {
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleWithPermissionsResponse,
} from '../../types/role';

export interface IRoleService {
  createRole(data: CreateRoleRequest): Promise<Role>;
  getRoleById(id: string): Promise<Role | null>;
  getRoleByIdWithPermissions(
    id: string
  ): Promise<RoleWithPermissionsResponse | null>;
  getRoleByName(name: string): Promise<Role | null>;
  getAllRoles(): Promise<Role[]>;
  updateRole(id: string, data: UpdateRoleRequest): Promise<Role>;
  deleteRole(id: string): Promise<Role>;

  getAllRolesForCompany(companyId: string): Promise<Role[]>;
  getSystemRoles(): Promise<Role[]>;
  getCustomRolesByCompany(companyId: string): Promise<Role[]>;
  getAvailableRolesForUser(userId: string): Promise<Role[]>;
  canModifyRole(
    roleId: string,
    companyId: string,
    isSystemAdmin: boolean
  ): Promise<boolean>;
  validateRoleCreation(
    roleName: string,
    companyId: string | undefined,
    isSystemAdmin: boolean
  ): Promise<void>;
}
