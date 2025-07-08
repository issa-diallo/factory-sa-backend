# Database with Prisma and PostgreSQL

This document explains how the PostgreSQL database and Prisma ORM are used in this project.

## Overview

Our application uses:

- **PostgreSQL** as a relational database management system
- **Prisma ORM** as an abstraction layer to interact with the database
- **Docker** to facilitate deployment and database isolation

## Why PostgreSQL and Prisma?

**PostgreSQL** is a powerful, open-source, and reliable relational database management system. It offers excellent performance, high SQL compliance, and numerous advanced features.

**Prisma ORM** simplifies database interaction by providing:

- A type-safe API for TypeScript
- An integrated migration system
- Automatic data validation
- Generation of optimized SQL queries

## Configuration

The database is configured to work automatically with the application. Connection parameters are defined in the `.env` file and the PostgreSQL service is configured in `docker-compose.yml`. The Prisma client is initialized in `src/database/prismaClient.ts`.

## Database Seeding

The project includes a seed script (`prisma/seed.ts`) that initializes the database with essential data:

- Default user roles (ADMIN, MANAGER, USER)
- Basic permissions
- Test company and domain
- Admin user

To run the seed script, use the command:

```bash
npx prisma db seed
```

## Useful Commands

- **Start the application with the database**: `docker compose up`
- **Generate the Prisma client**: `pnpm prisma generate`
- **Create a migration**: `pnpm prisma migrate dev --name migration_name`
- **Apply migrations**: `pnpm prisma migrate deploy`
- **Seed the database**: `pnpm db:seed`
- **Visualize the database**: `pnpm prisma studio`

## Client

3. Use the Prisma client in your code via `import { prisma } from '../database/prismaClient'`
