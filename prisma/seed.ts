/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Comprehensive Seed Script - Factory SA
 * Generates ~600 fake records across all tables for testing
 *
 * ROLE PASSWORDS:
 * - ADMIN: admin123
 * - MANAGER: manager123
 * - USER: user123
 */

import type { Role } from '../src/generated/prisma';
import { PrismaClient } from '../src/generated/prisma';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_PASSWORDS = {
  ADMIN: 'admin123',
  MANAGER: 'manager123',
  USER: 'user123',
};

// ============================================================================
// UTILS
// ============================================================================

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function pickMultiple<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedPermissions(): Promise<Record<string, any>> {
  console.log('🔒 Creating permissions...');

  // Packing Lists
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

  // Companies
  const companyRead = await prisma.permission.upsert({
    where: { name: 'company:read' },
    update: {},
    create: {
      name: 'company:read',
      description: 'Allows reading company information',
    },
  });

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

  // Domains
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

  // Permissions
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

  // Roles
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

  // Users
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

  // Company-Domain
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

  // Role-Permission
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

  // User-Role
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

  console.log('✅ Created 28 permissions');

  return {
    packingListRead,
    packingListCreate,
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
  };
}

async function seedSystemRoles(): Promise<{
  adminRole: Role;
  managerRole: Role;
  userRole: Role;
}> {
  console.log('👥 Creating system roles...');

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
      description: 'Company manager with management permissions',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard user with basic permissions',
    },
  });

  console.log('✅ Created 3 system roles');
  return { adminRole, managerRole, userRole };
}

async function seedRolePermissions(
  adminRole: any,
  managerRole: any,
  userRole: any,
  permissions: Record<string, any>
) {
  console.log('🔗 Assigning permissions to roles...');

  const adminPermissions = Object.values(permissions);
  const managerPermissions = [
    // Packing Lists
    permissions.packingListRead,
    permissions.packingListCreate,
    // Companies (no delete)
    permissions.companyRead,
    permissions.companyCreate,
    permissions.companyUpdate,
    // Domains
    permissions.domainRead,
    permissions.domainCreate,
    permissions.domainUpdate,
    permissions.domainDelete,
    // Company-Domain
    permissions.companyDomainCreate,
    permissions.companyDomainDelete,
    // Permissions (read only)
    permissions.permissionRead,
    // Roles (full CRUD)
    permissions.roleRead,
    permissions.roleCreate,
    permissions.roleUpdate,
    permissions.roleDelete,
    // Role-Permission
    permissions.rolePermissionCreate,
    permissions.rolePermissionDelete,
    // Users (full CRUD)
    permissions.userRead,
    permissions.userCreate,
    permissions.userUpdate,
    permissions.userDelete,
    // User-Role
    permissions.userRoleCreate,
    permissions.userRoleDelete,
  ];

  const userPermissions = [
    permissions.packingListRead,
    permissions.packingListCreate,
    permissions.companyRead,
    permissions.domainRead,
    permissions.userRead,
  ];

  // Assign Admin permissions
  for (const perm of adminPermissions) {
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

  // Assign Manager permissions
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

  // Assign User permissions
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

  console.log('✅ Assigned permissions: ADMIN(28), MANAGER(24), USER(5)');
}

async function seedCompanies(count: number): Promise<any[]> {
  console.log(`🏢 Generating ${count} companies...`);

  const sectors = [
    'Manufacturing',
    'Tech',
    'Logistics',
    'Retail',
    'Automotive',
    'Healthcare',
    'Finance',
    'Construction',
    'Food & Beverage',
    'Pharmaceutical',
  ];

  const companies: any[] = [];
  for (let i = 0; i < count; i++) {
    const sector = pickRandom(sectors);
    const companyName = `${faker.company.name().replace(/[,']/g, '')} ${sector} ${i + 1}`;

    const company = await prisma.company.create({
      data: {
        name: companyName,
        description: `${faker.company.catchPhrase()}, specializing in ${sector.toLowerCase()} industry.`,
        isActive: faker.datatype.boolean(0.9), // 90% active
      },
    });
    companies.push(company);
  }

  console.log(`✅ Generated ${companies.length} companies`);
  return companies;
}

async function seedDomains(count: number): Promise<any[]> {
  console.log(`🌐 Generating ${count} domains...`);

  const domains: any[] = [];
  for (let i = 0; i < count; i++) {
    const domainName = faker.internet.domainName().toLowerCase();

    const domain = await prisma.domain.create({
      data: {
        name: domainName,
        isActive: faker.datatype.boolean(0.95), // 95% active
      },
    });
    domains.push(domain);
  }

  console.log(`✅ Generated ${domains.length} domains`);
  return domains;
}

async function seedCompanyDomains(
  companies: any[],
  domains: any[],
  count: number
): Promise<any[]> {
  console.log(`🔗 Creating ${count} company-domain links...`);

  const links: any[] = [];
  for (let i = 0; i < count; i++) {
    const company = pickRandom(companies);
    const domain = pickRandom(domains);

    // Skip if link already exists
    const exists = await prisma.companyDomain.findUnique({
      where: {
        companyId_domainId: {
          companyId: company.id,
          domainId: domain.id,
        },
      },
    });

    if (exists) continue;

    const link = await prisma.companyDomain.create({
      data: {
        companyId: company.id,
        domainId: domain.id,
      },
    });
    links.push(link);

    if (links.length >= count) break;
  }

  console.log(`✅ Created ${links.length} company-domain links`);
  return links;
}

async function seedCustomRoles(
  companies: any[],
  count: number
): Promise<any[]> {
  console.log(`🎭 Generating ${count} custom roles...`);

  const customRoles: any[] = [];
  const managementRoles = [
    'Sales Manager',
    'Project Manager',
    'Operations Manager',
    'IT Manager',
    'HR Manager',
    'Quality Assurance',
    'Warehouse Supervisor',
    'Production Manager',
    'Finance Manager',
    'Logistics Coordinator',
    'Customer Service Manager',
    'Research & Development Lead',
    'Supply Chain Manager',
    'Marketing Manager',
    'Purchasing Manager',
    'Compliance Officer',
    'Safety Coordinator',
    'Team Lead',
    'Department Head',
    'Senior Analyst',
  ];

  for (let i = 0; i < count; i++) {
    const company = pickRandom(companies);
    const roleName = pickRandom(managementRoles);

    // Ensure unique name per company
    const uniqueName = `${roleName} - ${company.name}`;

    const customRole = await prisma.role.create({
      data: {
        name: uniqueName,
        description: `${roleName} role for ${company.name}`,
        companyId: company.id,
      },
    });
    customRoles.push(customRole);
  }

  console.log(`✅ Generated ${customRoles.length} custom roles`);
  return customRoles;
}

async function seedUsers(
  count: number
): Promise<{ adminUser: any; users: any[] }> {
  console.log(`👤 Generating ${count} users + admin...`);

  const users: any[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: await bcrypt.hash(ROLE_PASSWORDS.USER, 10), // USER password by default
        firstName,
        lastName,
        isActive: faker.datatype.boolean(0.85), // 85% active
        lastLoginAt: faker.datatype.boolean(0.7)
          ? faker.date.recent({ days: 30 })
          : null,
        lastLoginIp: faker.internet.ipv4(),
      },
    });
    users.push(user);
  }

  // Create/preserve admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: await bcrypt.hash(ROLE_PASSWORDS.ADMIN, 10), // ADMIN password
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: await bcrypt.hash(ROLE_PASSWORDS.ADMIN, 10), // ADMIN password
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });

  console.log(`✅ Generated ${users.length} users + 1 admin`);
  return { adminUser, users };
}

async function seedUserRoles(
  adminUser: any,
  users: any[],
  companies: any[],
  adminRole: any,
  managerRole: any,
  userRole: any,
  customRoles: any[]
) {
  console.log('🔑 Assigning user roles...');

  // Update passwords based on roles assigned
  const updateUserPassword = async (userId: string, password: string) => {
    await prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(password, 10) },
    });
  };

  // Admin distribution
  const adminUsers = [adminUser, ...pickMultiple(users, 4)]; // 5 admins total
  for (const user of adminUsers) {
    await updateUserPassword(user.id, ROLE_PASSWORDS.ADMIN);
  }
  for (let i = 0; i < adminUsers.length; i++) {
    const company = pickRandom(companies);
    await prisma.userRole.upsert({
      where: {
        userId_companyId: {
          userId: adminUsers[i].id,
          companyId: company.id,
        },
      },
      update: { roleId: adminRole.id },
      create: {
        userId: adminUsers[i].id,
        companyId: company.id,
        roleId: adminRole.id,
      },
    });
  }

  // Manager distribution
  const remainingUsers = users.filter(u => !adminUsers.includes(u));
  const managerUsers = pickMultiple(remainingUsers, 20); // 20 managers
  for (const user of managerUsers) {
    await updateUserPassword(user.id, ROLE_PASSWORDS.MANAGER);
  }
  for (const user of managerUsers) {
    const company = pickRandom(companies);
    await prisma.userRole.upsert({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: company.id,
        },
      },
      update: { roleId: managerRole.id },
      create: {
        userId: user.id,
        companyId: company.id,
        roleId: managerRole.id,
      },
    });
  }

  // User distribution (remaining users keep USER password)
  const regularUsers = remainingUsers.filter(u => !managerUsers.includes(u));
  for (const user of regularUsers) {
    const company = pickRandom(companies);
    await prisma.userRole.upsert({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: company.id,
        },
      },
      update: { roleId: userRole.id },
      create: {
        userId: user.id,
        companyId: company.id,
        roleId: userRole.id,
      },
    });
  }

  // Custom roles distribution (assigned additional passwords randomly)
  const usersForCustom = pickMultiple([...remainingUsers, ...managerUsers], 30);
  for (let i = 0; i < usersForCustom.length && i < customRoles.length; i++) {
    const company = pickRandom(companies);
    const user = usersForCustom[i];
    const role = customRoles[i];

    await prisma.userRole.upsert({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: company.id,
        },
      },
      update: { roleId: role.id },
      create: {
        userId: user.id,
        companyId: company.id,
        roleId: role.id,
      },
    });
  }

  console.log('✅ Assigned roles to users');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Starting comprehensive seeding...');

  try {
    // 1. Permissions (28)
    const permissions = await seedPermissions();

    // 2. System Roles (3)
    const { adminRole, managerRole, userRole } = await seedSystemRoles();

    // 3. Role Permissions (corrected assignments)
    await seedRolePermissions(adminRole, managerRole, userRole, permissions);

    // 4. Companies (50)
    const companies = await seedCompanies(50);

    // 5. Domains (60)
    const domains = await seedDomains(60);

    // 6. Company-Domain Links (100)
    await seedCompanyDomains(companies, domains, 100);

    // 7. Custom Roles (20)
    const customRoles = await seedCustomRoles(companies, 20);

    // 8. Users (100 + 1 admin)
    const { adminUser, users } = await seedUsers(100);

    // 9. User-Role Assignments (150+)
    await seedUserRoles(
      adminUser,
      users,
      companies,
      adminRole,
      managerRole,
      userRole,
      customRoles
    );

    console.log('🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('• Permissions: 28');
    console.log('• System Roles: 3');
    console.log('• Companies: 50');
    console.log('• Domains: 60');
    console.log('• Company-Domain links: 100');
    console.log('• Custom Roles: 20');
    console.log('• Users: 101 (including 1 admin)');
    console.log('• User-Role assignments: 150+');
    console.log('\n🔑 Test Credentials by Role:');
    console.log('\n📈 ADMIN users (5):');
    console.log('  Password: admin123');
    console.log('  → Choose any admin via Prisma Studio');
    console.log('\n📋 MANAGER users (20):');
    console.log('  Password: manager123');
    console.log('  → Choose any manager via Prisma Studio');
    console.log('\n👤 USER accounts (~76):');
    console.log('  Password: user123');
    console.log('  → Choose any user via Prisma Studio');

    console.log('\n📖 Full documentation: prisma/SEED_CREDENTIALS.md');
    console.log('\n✨ Database ready for development!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
