import { IPermissionService } from './interfaces';
import { Permission, RolePermission } from '../../generated/prisma';
import {
  CreatePermissionRequest,
  CreateRolePermissionRequest,
  UpdatePermissionRequest,
} from '../../types/permission';
import { injectable, inject } from 'tsyringe';
import { IPermissionRepository } from '../../repositories/permission/IPermissionRepository';
import { IRolePermissionRepository } from '../../repositories/rolePermission/IRolePermissionRepository';

@injectable()
export class PermissionService implements IPermissionService {
  private permissionRepository: IPermissionRepository;
  private rolePermissionRepository: IRolePermissionRepository;

  constructor(
    @inject('IPermissionRepository')
    permissionRepository: IPermissionRepository,
    @inject('IRolePermissionRepository')
    rolePermissionRepository: IRolePermissionRepository
  ) {
    this.permissionRepository = permissionRepository;
    this.rolePermissionRepository = rolePermissionRepository;
  }

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return this.permissionRepository.create(data);
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findById(id);
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findByName(name);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest
  ): Promise<Permission> {
    return this.permissionRepository.update(id, data);
  }

  async deletePermission(id: string): Promise<Permission> {
    return this.permissionRepository.delete(id);
  }

  async createRolePermission(
    data: CreateRolePermissionRequest
  ): Promise<RolePermission> {
    const prismaData = {
      role: { connect: { id: data.roleId } },
      permission: { connect: { id: data.permissionId } },
    };
    return this.rolePermissionRepository.create(prismaData);
  }

  async getRolePermissionById(id: string): Promise<RolePermission | null> {
    return this.rolePermissionRepository.findById(id);
  }

  async getRolePermissionsByRoleId(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissionRepository.findRolePermissionsByRoleId(roleId);
  }

  async deleteRolePermission(id: string): Promise<RolePermission> {
    return this.rolePermissionRepository.delete(id);
  }
}
