import { prisma } from '../../src/database/prismaClient';
import { faker } from '@faker-js/faker';
import { User } from '../../src/generated/prisma/client';
import { PasswordService } from '../../src/services/auth/passwordService';

import { container } from 'tsyringe';
const passwordService = container.resolve(PasswordService);

interface CreateTestUserOptions {
  email?: string;
  password?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
}

export async function createTestUser(
  overrides: Partial<CreateTestUserOptions> = {}
): Promise<User> {
  const password = overrides.password ?? faker.internet.password();
  const email =
    overrides.email?.toLowerCase() ??
    faker.internet
      .email({ provider: faker.string.uuid() + '.com' })
      .toLowerCase();
  const isActive = overrides.isActive ?? true;

  const hashedPassword = await passwordService.hash(password);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isActive,
      firstName: overrides.firstName ?? faker.person.firstName(),
      lastName: overrides.lastName ?? faker.person.lastName(),
    },
  });
}
