import { prisma } from '../../src/database/prismaClient';
import { createTestCompany } from './companyFactory';
import { createTestDomain } from './domainFactory';

export async function createTestCompanyDomain({
  companyId,
  domainId,
}: {
  companyId?: string;
  domainId?: string;
} = {}) {
  const company = companyId ? { id: companyId } : await createTestCompany();
  const domain = domainId ? { id: domainId } : await createTestDomain();

  return await prisma.companyDomain.create({
    data: {
      companyId: company.id,
      domainId: domain.id,
    },
  });
}
