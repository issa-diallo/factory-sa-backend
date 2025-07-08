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

  // Assign permissions to roles
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: packingListRead.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: packingListRead.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: packingListCreate.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: packingListCreate.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: userManage.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: userManage.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: companyRead.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: companyRead.id },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: packingListRead.id,
      },
    },
    update: {},
    create: { roleId: managerRole.id, permissionId: packingListRead.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: packingListCreate.id,
      },
    },
    update: {},
    create: { roleId: managerRole.id, permissionId: packingListCreate.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: userManage.id,
      },
    },
    update: {},
    create: { roleId: managerRole.id, permissionId: userManage.id },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: userRole.id,
        permissionId: packingListRead.id,
      },
    },
    update: {},
    create: { roleId: userRole.id, permissionId: packingListRead.id },
  });

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
