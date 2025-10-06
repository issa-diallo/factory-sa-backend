import { PrismaClient } from '../../src/generated/prisma';

async function updateExistingRoles() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Migration des rôles existants...');

    // Les rôles système restent avec companyId = null (valeur par défaut)
    const systemRoles = ['ADMIN', 'MANAGER', 'USER'];

    console.log('✅ Rôles système (companyId = null) :');
    const systemRolesInDb = await prisma.role.findMany({
      where: {
        name: { in: systemRoles },
      },
      select: { id: true, name: true },
    });
    console.log(`   ${systemRolesInDb.length} rôles système identifiés`);

    // Pour les rôles personnalisés existants, déduire le companyId depuis UserRole
    const customRoles = await prisma.role.findMany({
      where: {
        name: { notIn: systemRoles },
      },
      include: {
        userRoles: {
          select: { companyId: true },
          distinct: ['companyId'], // Une seule occurrence par companyId
        },
      },
    });

    console.log('\n📝 Migration des rôles personnalisés :');
    let updatedCount = 0;
    let skippedCount = 0;

    for (const role of customRoles) {
      if (role.userRoles.length > 0) {
        // Assigner au premier companyId trouvé (hypothèse: rôle créé par cette entreprise)
        const primaryCompanyId = role.userRoles[0].companyId;

        await prisma.role.update({
          where: { id: role.id },
          data: { companyId: primaryCompanyId },
        });

        updatedCount++;
        console.log(
          `   ✅ ${role.name} → Company ${primaryCompanyId} (${role.userRoles.length} entreprise(s))`
        );
      } else {
        skippedCount++;
        console.log(
          `   ⚠️  ${role.name} → Aucun utilisateur assigné, companyId reste NULL`
        );
      }
    }

    console.log('\n📊 Résumé de la migration:');
    console.log(`   ✅ ${updatedCount} rôles migrés`);
    console.log(`   ⚠️  ${skippedCount} rôles sans utilisateurs (non migrés)`);
    console.log('✅ Migration terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter uniquement si appelé directement
if (require.main === module) {
  updateExistingRoles()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { updateExistingRoles };
