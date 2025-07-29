import { Permission, Prisma } from '../../generated/prisma';

export interface IPermissionRepository {
  create(data: Prisma.PermissionCreateInput): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  update(id: string, data: Prisma.PermissionUpdateInput): Promise<Permission>;
  delete(id: string): Promise<Permission>;
}
