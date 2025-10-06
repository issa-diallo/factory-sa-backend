# 🔑 Identifiants de Test - Base de Données Seed

## 📊 Vue d'ensemble

- **101 utilisateurs** générés (1 admin principal + 100 fictifs)
- **Mots de passe standardisés par rôle** pour faciliter les tests
- **600+ enregistrements** au total dans la base de données

## 🔐 Identifiants par Rôle

### ADMIN (5 utilisateurs)

**Mot de passe :** `admin123`

#### ✋ Compte principal :

- Email: `admin@test.com`
- Password: `admin123`
- ⚠️ **Connexion recommandée pour les tests principaux**

#### ➕ Comptes supplémentaires :

- 4 autres admins avec des emails générés aléatoirement via Faker
- Exemples d'emails potentiels :
  - `john.doe@example.com`
  - `jane.smith@company.net`
  - etc.

**📈 Permissions ADMIN :**

- Toutes les permissions système (28 permissions)
- Peut gérer toutes les entreprises et utilisateurs

---

### MANAGER (20 utilisateurs)

**Mot de passe :** `manager123`

- Emails générés automatiquement avec Faker
- Répartis sur différentes entreprises
- Profil management intermédiaire

**📋 Permissions MANAGER :**

- Management complet des entreprises/domaines/rôles
- Gestion des utilisateurs (CRUD)
- Pas de suppression d'entreprises
- Gestion des Packing Lists

**💼 Rôles typiques :**

- Sales Manager - Company X
- Project Manager - Company Y
- Operations Manager - Company Z
- etc.

---

### USER (76 utilisateurs)

**Mot de passe :** `user123`

- Utilisateurs standards avec accès limité
- Emails générés automatiquement
- Aucun rôle de gestion

**👤 Permissions USER :**

- Lecture seule sur la plupart des éléments (Company, Domain, User)
- Peut créer et lire les Packing Lists

---

## 🎯 Comment Tester

### 1. Connexion Rapide

```bash
# Démarrer le serveur
pnpm dev

# Prisma Studio pour explorer les données
http://localhost:5555
```

### 2. Tests par Profil

#### 🔐 ADMIN Test Account :

```
Email: admin@test.com
Password: admin123
```

#### 📋 MANAGER Test (choisir un via Prisma Studio) :

```
Email: [trouver dans Prisma Studio]
Password: manager123
```

#### 👤 USER Test (choisir un via Prisma Studio) :

```
Email: [trouver dans Prisma Studio]
Password: user123
```

### 3. Via l'API

```bash
# Connexion admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Connexion manager (remplacer email)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager_email@domain.com","password":"manager123"}'

# Connexion user standard
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user_email@domain.com","password":"user123"}'
```

---

## 🏗️ Architecture des Données

### 📄 Comptes Généalogiques

- **1 Admin principal** (préservé)
- **4 Admins supplémentaires** (distribués aléatoirement)
- **20 Managers** (rôles de gestion)
- **76 Users standards** (accès limité)
- **Utilisateurs avec rôles personnalisés** (30+ attributions)

### 🌐 Distributions

- **50 entreprises** dans 10 secteurs différents
- **60 domaines** liés aux entreprises
- **100 liens** entreprise-domaine
- **20 rôles personnalisés** par entreprise
- **150+ attributions** de rôles aux utilisateurs

---

## 🔄 Régénération

Pour régénérer avec de nouvelles données :

```bash
# Nettoyer et re-seeder
pnpm db:reset

# Ou seulement re-seeder
pnpm db:seed
```

**⚠️ Attention :**

- Les emails seront différents à chaque génération
- Le compte admin principal sera préservé
- Les mots de passe resteront identiques par rôle

---

## 🐛 Dépannage

### Problème : Mot de passe ne fonctionne pas

✅ **Vérifier :** L'utilisateur a-t-il le bon rôle attribué ?
✅ **Vérification :** Utiliser Prisma Studio pour voir les UserRole

### Problème : Aucun utilisateur visible

✅ **Commande :** `pnpm db:seed` a-t-elle été exécutée ?
✅ **Vérification :** Regarder les logs de seeding

### Problème : Permissions insuffisantes

✅ **Vérifier :** Le rôle correspond-il aux permissions attendues ?
✅ **Référence :** Voir `permissions` dans le code source

---

## 📈 Évolution

Pour ajouter un nouveau rôle de test :

1. Ajouter `NEW_ROLE: 'new123'` dans `ROLE_PASSWORDS`
2. Modifier `seedUserRoles()` pour assigner le rôle
3. Mettre à jour cette documentation

---

### 🎯 Rappel : Cette base de données est pour le développement uniquement

**🔐 Ne pas utiliser en production !**
