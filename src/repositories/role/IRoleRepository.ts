import { Role, Prisma } from '../../generated/prisma';

export interface IRoleRepository {
  create(data: Prisma.RoleCreateInput): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(id: string, data: Prisma.RoleUpdateInput): Promise<Role>;
  delete(id: string): Promise<Role>;
}
