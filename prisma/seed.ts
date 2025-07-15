import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding script...');

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System administrator with full permissions',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Company manager',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard user',
    },
  });

  console.log('Roles created or updated:', {
    adminRole,
    managerRole,
    userRole,
  });

  // Create base permissions
  const packingListRead = await prisma.permission.upsert({
    where: { name: 'packing_list:read' },
    update: {},
    create: {
      name: 'packing_list:read',
      description: 'Allows reading packing lists',
    },
  });

  const packingListCreate = await prisma.permission.upsert({
    where: { name: 'packing_list:create' },
    update: {},
    create: {
      name: 'packing_list:create',
      description: 'Allows creating packing lists',
    },
  });

  const userManage = await prisma.permission.upsert({
    where: { name: 'user:manage' },
    update: {},
    create: {
      name: 'user:manage',
      description: 'Allows managing users (create, edit, delete)',
    },
  });

  const companyRead = await prisma.permission.upsert({
    where: { name: 'company:read' },
    update: {},
    create: {
      name: 'company:read',
      description: 'Allows reading company information',
    },
  });

  console.log('Permissions created or updated:', {
    packingListRead,
    packingListCreate,
    userManage,
    companyRead,
  });

  // Add new permissions
  const companyCreate = await prisma.permission.upsert({
    where: { name: 'company:create' },
    update: {},
    create: {
      name: 'company:create',
      description: 'Allows creating companies',
    },
  });
  const companyUpdate = await prisma.permission.upsert({
    where: { name: 'company:update' },
    update: {},
    create: {
      name: 'company:update',
      description: 'Allows updating companies',
    },
  });
  const companyDelete = await prisma.permission.upsert({
    where: { name: 'company:delete' },
    update: {},
    create: {
      name: 'company:delete',
      description: 'Allows deleting companies',
    },
  });

  const domainRead = await prisma.permission.upsert({
    where: { name: 'domain:read' },
    update: {},
    create: {
      name: 'domain:read',
      description: 'Allows reading domains',
    },
  });
  const domainCreate = await prisma.permission.upsert({
    where: { name: 'domain:create' },
    update: {},
    create: {
      name: 'domain:create',
      description: 'Allows creating domains',
    },
  });
  const domainUpdate = await prisma.permission.upsert({
    where: { name: 'domain:update' },
    update: {},
    create: {
      name: 'domain:update',
      description: 'Allows updating domains',
    },
  });
  const domainDelete = await prisma.permission.upsert({
    where: { name: 'domain:delete' },
    update: {},
    create: {
      name: 'domain:delete',
      description: 'Allows deleting domains',
    },
  });

  const permissionRead = await prisma.permission.upsert({
    where: { name: 'permission:read' },
    update: {},
    create: {
      name: 'permission:read',
      description: 'Allows reading permissions',
    },
  });
  const permissionCreate = await prisma.permission.upsert({
    where: { name: 'permission:create' },
    update: {},
    create: {
      name: 'permission:create',
      description: 'Allows creating permissions',
    },
  });
  const permissionUpdate = await prisma.permission.upsert({
    where: { name: 'permission:update' },
    update: {},
    create: {
      name: 'permission:update',
      description: 'Allows updating permissions',
    },
  });
  const permissionDelete = await prisma.permission.upsert({
    where: { name: 'permission:delete' },
    update: {},
    create: {
      name: 'permission:delete',
      description: 'Allows deleting permissions',
    },
  });

  const roleRead = await prisma.permission.upsert({
    where: { name: 'role:read' },
    update: {},
    create: {
      name: 'role:read',
      description: 'Allows reading roles',
    },
  });
  const roleCreate = await prisma.permission.upsert({
    where: { name: 'role:create' },
    update: {},
    create: {
      name: 'role:create',
      description: 'Allows creating roles',
    },
  });
  const roleUpdate = await prisma.permission.upsert({
    where: { name: 'role:update' },
    update: {},
    create: {
      name: 'role:update',
      description: 'Allows updating roles',
    },
  });
  const roleDelete = await prisma.permission.upsert({
    where: { name: 'role:delete' },
    update: {},
    create: {
      name: 'role:delete',
      description: 'Allows deleting roles',
    },
  });

  const userRead = await prisma.permission.upsert({
    where: { name: 'user:read' },
    update: {},
    create: {
      name: 'user:read',
      description: 'Allows reading users',
    },
  });
  const userCreate = await prisma.permission.upsert({
    where: { name: 'user:create' },
    update: {},
    create: {
      name: 'user:create',
      description: 'Allows creating users',
    },
  });
  const userUpdate = await prisma.permission.upsert({
    where: { name: 'user:update' },
    update: {},
    create: {
      name: 'user:update',
      description: 'Allows updating users',
    },
  });
  const userDelete = await prisma.permission.upsert({
    where: { name: 'user:delete' },
    update: {},
    create: {
      name: 'user:delete',
      description: 'Allows deleting users',
    },
  });

  const companyDomainCreate = await prisma.permission.upsert({
    where: { name: 'companyDomain:create' },
    update: {},
    create: {
      name: 'companyDomain:create',
      description: 'Allows creating company-domain links',
    },
  });
  const companyDomainDelete = await prisma.permission.upsert({
    where: { name: 'companyDomain:delete' },
    update: {},
    create: {
      name: 'companyDomain:delete',
      description: 'Allows deleting company-domain links',
    },
  });

  const rolePermissionCreate = await prisma.permission.upsert({
    where: { name: 'rolePermission:create' },
    update: {},
    create: {
      name: 'rolePermission:create',
      description: 'Allows creating role-permission links',
    },
  });
  const rolePermissionDelete = await prisma.permission.upsert({
    where: { name: 'rolePermission:delete' },
    update: {},
    create: {
      name: 'rolePermission:delete',
      description: 'Allows deleting role-permission links',
    },
  });

  const userRoleCreate = await prisma.permission.upsert({
    where: { name: 'userRole:create' },
    update: {},
    create: {
      name: 'userRole:create',
      description: 'Allows creating user-role links',
    },
  });
  const userRoleDelete = await prisma.permission.upsert({
    where: { name: 'userRole:delete' },
    update: {},
    create: {
      name: 'userRole:delete',
      description: 'Allows deleting user-role links',
    },
  });

  console.log('All permissions created or updated.');

  // Assign permissions to roles
  // ADMIN role gets all permissions
  const allPermissions = [
    packingListRead,
    packingListCreate,
    userManage,
    companyRead,
    companyCreate,
    companyUpdate,
    companyDelete,
    domainRead,
    domainCreate,
    domainUpdate,
    domainDelete,
    permissionRead,
    permissionCreate,
    permissionUpdate,
    permissionDelete,
    roleRead,
    roleCreate,
    roleUpdate,
    roleDelete,
    userRead,
    userCreate,
    userUpdate,
    userDelete,
    companyDomainCreate,
    companyDomainDelete,
    rolePermissionCreate,
    rolePermissionDelete,
    userRoleCreate,
    userRoleDelete,
  ];

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // MANAGER role gets specific permissions
  const managerPermissions = [
    packingListRead,
    packingListCreate,
    userManage, // Keep userManage for now, can be refined later
    companyRead,
    companyCreate,
    companyUpdate,
    domainRead,
    userRead,
    userCreate,
    userUpdate,
    userRoleCreate,
    userRoleDelete,
  ];

  for (const perm of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: managerRole.id, permissionId: perm.id },
    });
  }

  // USER role gets basic read permissions
  const userPermissions = [packingListRead, companyRead, domainRead, userRead];

  for (const perm of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: userRole.id, permissionId: perm.id },
    });
  }

  console.log('Permissions assigned to roles.');

  // Create test company
  const testCompany = await prisma.company.upsert({
    where: { name: 'Test Company' },
    update: {},
    create: {
      name: 'Test Company',
      description: 'Test company for development purposes',
      isActive: true,
    },
  });
  console.log('Test company created or updated:', testCompany);

  // Create test domain
  const testDomain = await prisma.domain.upsert({
    where: { name: 'test.com' },
    update: {},
    create: {
      name: 'test.com',
      isActive: true,
    },
  });
  console.log('Test domain created or updated:', testDomain);

  // Link domain to company
  await prisma.companyDomain.upsert({
    where: {
      companyId_domainId: {
        companyId: testCompany.id,
        domainId: testDomain.id,
      },
    },
    update: {},
    create: {
      companyId: testCompany.id,
      domainId: testDomain.id,
    },
  });
  console.log('Domain linked to company.');

  // Create initial admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });
  console.log('Admin user created or updated:', adminUser);

  // Link admin user to test company with ADMIN role
  await prisma.userRole.upsert({
    where: {
      userId_companyId: {
        userId: adminUser.id,
        companyId: testCompany.id,
      },
    },
    update: { roleId: adminRole.id },
    create: {
      userId: adminUser.id,
      companyId: testCompany.id,
      roleId: adminRole.id,
    },
  });
  console.log('Admin user linked to test company with ADMIN role.');

  console.log('Seeding script completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
