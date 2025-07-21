import { prisma } from '../../src/database/prismaClient';
import { faker } from '@faker-js/faker';

export async function createTestPermission(
  overrides: Partial<{ name: string; description: string }> = {}
) {
  return await prisma.permission.create({
    data: {
      name: overrides.name ?? faker.word.words(1),
      description: overrides.description ?? faker.word.words(3),
    },
  });
}
