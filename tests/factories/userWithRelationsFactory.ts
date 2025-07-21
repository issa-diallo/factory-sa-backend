import { prisma } from '../../src/database/prismaClient';
import { createTestCompany } from './companyFactory';
import { createTestRole } from './roleFactory';
import { createTestUser } from './userFactory';
import { Company } from '../../src/generated/prisma/client';

export async function createTestUserWithRelations(
  overrides: Partial<Parameters<typeof createTestUser>[0]> & {
    company?: Company;
  } = {}
) {
  const company = overrides.company || (await createTestCompany());
  const role = await createTestRole();
  const { ...userOverrides } = overrides;
  const user = await createTestUser(userOverrides);

  await prisma.userRole.create({
    data: {
      userId: user.id,
      companyId: company.id,
      roleId: role.id,
    },
  });

  // Ajout d'une permission liée au rôle pour éviter erreur dans login
  const permission = await prisma.permission.create({
    data: {
      name: 'TEST_PERMISSION_' + Math.random().toString(36).substring(2, 8),
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: role.id,
      permissionId: permission.id,
    },
  });

  return user;
}
