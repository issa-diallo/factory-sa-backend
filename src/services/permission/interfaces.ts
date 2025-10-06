import { Permission, RolePermission } from '../../generated/prisma';
import {
  CreatePermissionRequest,
  CreateRolePermissionRequest,
  UpdatePermissionRequest,
} from '../../types/permission';

export interface IPermissionService {
  createPermission(data: CreatePermissionRequest): Promise<Permission>;
  getPermissionById(id: string): Promise<Permission | null>;
  getPermissionByName(name: string): Promise<Permission | null>;
  getAllPermissions(): Promise<Permission[]>;
  updatePermission(
    id: string,
    data: UpdatePermissionRequest
  ): Promise<Permission>;
  deletePermission(id: string): Promise<Permission>;

  canModifyPermission(isSystemAdmin: boolean): boolean;

  createRolePermission(
    data: CreateRolePermissionRequest
  ): Promise<RolePermission>;
  canAssignPermissionToRole(
    roleId: string,
    permissionId: string,
    companyId: string,
    isSystemAdmin: boolean
  ): Promise<boolean>;
  getRolePermissionById(id: string): Promise<RolePermission | null>;
  getRolePermissionsByRoleId(roleId: string): Promise<RolePermission[]>;
  deleteRolePermission(id: string): Promise<RolePermission>;
}
