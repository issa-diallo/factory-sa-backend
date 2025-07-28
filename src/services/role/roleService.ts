import { IRoleService } from './interfaces';
import { Role } from '../../generated/prisma';
import { CreateRoleRequest, UpdateRoleRequest } from '../../types/role';
import { injectable, inject } from 'tsyringe';
import { IRoleRepository } from '../../repositories/role/IRoleRepository';

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
}
