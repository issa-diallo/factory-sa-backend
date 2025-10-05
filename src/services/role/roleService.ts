import { IRoleService } from './interfaces';
import { Role } from '../../generated/prisma';
import {
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleWithPermissionsResponse,
} from '../../types/role';
import { injectable, inject } from 'tsyringe';
import { IRoleRepository } from '../../repositories/role/IRoleRepository';
import { ForbiddenError } from '../../errors/customErrors';

@injectable()
export class RoleService implements IRoleService {
  private roleRepository: IRoleRepository;

  constructor(@inject('IRoleRepository') roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return this.roleRepository.create(data);
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async getRoleByIdWithPermissions(
    id: string
  ): Promise<RoleWithPermissionsResponse | null> {
    return this.roleRepository.findByIdWithPermissions(id);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return this.roleRepository.update(id, data);
  }

  async deleteRole(id: string): Promise<Role> {
    return this.roleRepository.delete(id);
  }

  async getAllRolesForCompany(companyId: string): Promise<Role[]> {
    return this.roleRepository.findAllRolesForCompany(companyId);
  }

  async getSystemRoles(): Promise<Role[]> {
    return this.roleRepository.findSystemRoles();
  }

  async getCustomRolesByCompany(companyId: string): Promise<Role[]> {
    return this.roleRepository.findCustomRolesByCompany(companyId);
  }

  async canModifyRole(
    roleId: string,
    companyId: string,
    isSystemAdmin: boolean
  ): Promise<boolean> {
    if (isSystemAdmin) {
      return true;
    }

    const isSystem = await this.roleRepository.isSystemRole(roleId);
    if (isSystem) {
      return false;
    }

    const role = await this.roleRepository.findRoleWithCompanyValidation(
      roleId,
      companyId
    );

    return role !== null;
  }

  async validateRoleCreation(
    roleName: string,
    isSystemAdmin: boolean
  ): Promise<void> {
    if (isSystemAdmin) {
      return;
    }

    // Prevent the creation of system roles by non-System Admins
    if (['ADMIN', 'MANAGER', 'USER'].includes(roleName)) {
      throw new ForbiddenError('Cannot create system roles');
    }

    const existingRole = await this.roleRepository.findByName(roleName);
    if (existingRole) {
      throw new ForbiddenError('Role already exists');
    }
  }
}
