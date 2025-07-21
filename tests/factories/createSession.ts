import { faker } from '@faker-js/faker';
import { prisma } from '../../src/database/prismaClient';

export async function createTestSession(userId: string) {
  return await prisma.session.create({
    data: {
      userId,
      token: faker.string.uuid(),
      expiresAt: faker.date.future(),
    },
  });
}
