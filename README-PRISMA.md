# Base de données avec Prisma et PostgreSQL

Ce document explique comment la base de données PostgreSQL et l'ORM Prisma sont utilisés dans ce projet.

## Présentation

Notre application utilise :

- **PostgreSQL** comme système de gestion de base de données relationnelle
- **Prisma ORM** comme couche d'abstraction pour interagir avec la base de données
- **Docker** pour faciliter le déploiement et l'isolation de la base de données

## Pourquoi PostgreSQL et Prisma ?

**PostgreSQL** est un système de gestion de base de données relationnel puissant, open-source et fiable. Il offre d'excellentes performances, une grande conformité SQL et de nombreuses fonctionnalités avancées.

**Prisma ORM** simplifie l'interaction avec la base de données en offrant :

- Une API type-safe pour TypeScript
- Un système de migration intégré
- Une validation automatique des données
- Une génération de requêtes SQL optimisées

## Configuration

La base de données est configurée pour fonctionner automatiquement avec l'application. Les paramètres de connexion sont définis dans le fichier `.env` et le service PostgreSQL est configuré dans `docker-compose.yml`. Le client Prisma est initialisé dans `src/database/client.ts`.

## Commandes utiles

- **Démarrer l'application avec la base de données** : `docker compose up`
- **Générer le client Prisma** : `pnpm prisma generate`
- **Créer une migration** : `pnpm prisma migrate dev --name nom_de_la_migration`
- **Appliquer les migrations** : `pnpm prisma migrate deploy`
- **Visualiser la base de données** : `pnpm prisma studio`

## Client

3. Utilisez le client Prisma dans votre code via `import { prisma } from '../database/client'`
