import { prisma } from '../../src/database/prismaClient';
import { createTestRole } from './roleFactory';
import { createTestPermission } from './permissionFactory';

export async function createTestRolePermission({
  roleId,
  permissionId,
}: {
  roleId?: string;
  permissionId?: string;
} = {}) {
  const role = roleId ? { id: roleId } : await createTestRole();
  const permission = permissionId
    ? { id: permissionId }
    : await createTestPermission();

  return await prisma.rolePermission.create({
    data: {
      roleId: role.id,
      permissionId: permission.id,
    },
  });
}
