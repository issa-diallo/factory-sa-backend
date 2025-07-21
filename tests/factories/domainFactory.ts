import { prisma } from '../../src/database/prismaClient';
import { faker } from '@faker-js/faker';
import { Company } from '../../src/generated/prisma/client';

export async function createTestDomain(
  overrides: Partial<{ name: string; isActive: boolean }> & {
    companyId?: string;
    company?: Company;
  } = {}
) {
  const domain = await prisma.domain.create({
    data: {
      name: overrides.name ?? faker.internet.domainName(),
      isActive: overrides.isActive ?? true,
    },
  });

  if (overrides.companyId || overrides.company) {
    const companyId = overrides.companyId || overrides.company?.id;
    if (companyId) {
      await prisma.companyDomain.create({
        data: {
          companyId: companyId,
          domainId: domain.id,
        },
      });
    }
  }

  return domain;
}
