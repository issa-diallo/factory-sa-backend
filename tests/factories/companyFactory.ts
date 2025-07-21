import { prisma } from '../../src/database/prismaClient';
import { faker } from '@faker-js/faker';

export async function createTestCompany(
  overrides: Partial<{ name: string; description: string }> = {}
) {
  return await prisma.company.create({
    data: {
      name: overrides.name ?? faker.company.name(),
      description: overrides.description ?? faker.company.catchPhrase(),
    },
  });
}
