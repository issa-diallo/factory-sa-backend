import { User, Prisma } from '../../generated/prisma';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  delete(id: string): Promise<User>;
  findAll(): Promise<User[]>;
  updateUserLastLogin(
    userId: string,
    lastLoginIp: string | undefined
  ): Promise<void>;
}
