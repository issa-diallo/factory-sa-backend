import { IUserManagementService } from './interfaces';
import { normalizeEmail } from '../../utils/normalizeEmail';
import { IPasswordService } from '../auth/interfaces';
import {
  CreateUserRequest,
  CreateUserRoleRequest,
  UpdateUserRequest,
} from '../../types/userManagement';
import { User, UserRole, Prisma } from '../../generated/prisma';
import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../repositories/user/IUserRepository';
import { IUserRoleRepository } from '../../repositories/userRole/IUserRoleRepository';
import { IRoleRepository } from '../../repositories/role/IRoleRepository';
import { ForbiddenError } from '../../errors/customErrors';

@injectable()
export class UserManagementService implements IUserManagementService {
  private userRepository: IUserRepository;
  private userRoleRepository: IUserRoleRepository;
  private roleRepository: IRoleRepository;
  private passwordService: IPasswordService;

  constructor(
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IUserRoleRepository') userRoleRepository: IUserRoleRepository,
    @inject('IRoleRepository') roleRepository: IRoleRepository,
    @inject('IPasswordService') passwordService: IPasswordService
  ) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.roleRepository = roleRepository;
    this.passwordService = passwordService;
  }

  async createUser(data: CreateUserRequest): Promise<Omit<User, 'password'>> {
    const hashedPassword = await this.passwordService.hash(data.password);
    const user = await this.userRepository.create({
      email: normalizeEmail(data.email),
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive ?? true,
    });
    return user;
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(normalizeEmail(email));
  }

  async getAllUsers(companyFilter?: {
    companyId?: string;
  }): Promise<Omit<User, 'password'>[]> {
    if (companyFilter?.companyId) {
      return this.userRepository.findUsersByCompany(companyFilter.companyId);
    }
    return this.userRepository.findAll();
  }

  async updateUser(
    id: string,
    data: UpdateUserRequest
  ): Promise<Omit<User, 'password'>> {
    if (data.email) {
      data.email = normalizeEmail(data.email);
    }

    if (data.password) {
      data.password = await this.passwordService.hash(data.password);
    }
    const updatedUser = await this.userRepository.update(id, data);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepository.delete(id);
  }

  async createUserRole(data: CreateUserRoleRequest): Promise<UserRole> {
    const prismaData: Prisma.UserRoleCreateInput = {
      user: { connect: { id: data.userId } },
      company: { connect: { id: data.companyId } },
      role: { connect: { id: data.roleId } },
    };
    return this.userRoleRepository.create(prismaData);
  }

  async getUserRoleById(id: string): Promise<UserRole | null> {
    return this.userRoleRepository.findById(id);
  }

  async getUserRolesByUserId(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.findByUserId(userId);
  }

  async getUserRolesByCompanyId(companyId: string): Promise<UserRole[]> {
    return this.userRoleRepository.findByCompanyId(companyId);
  }

  async getUserRolesByRoleId(roleId: string): Promise<UserRole[]> {
    return this.userRoleRepository.findByRoleId(roleId);
  }

  async deleteUserRole(id: string): Promise<UserRole> {
    return this.userRoleRepository.delete(id);
  }

  /**
   * Validates if a user role can be assigned during user creation.
   * Prevents managers from creating users with ADMIN role.
   *
   * @param roleId - The ID of the role to be assigned
   * @param isSystemAdmin - Whether the user creating the assignment is a system admin
   * @throws ForbiddenError if a manager tries to assign ADMIN role
   */
  async validateUserRoleCreation(
    roleId: string,
    isSystemAdmin: boolean
  ): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      // Role existence is validated elsewhere, so this shouldn't happen
      return;
    }

    // Only system admins can assign the ADMIN role
    if (role.name === 'ADMIN' && !isSystemAdmin) {
      throw new ForbiddenError(
        'Only system administrators can create users with ADMIN role'
      );
    }
  }
}
