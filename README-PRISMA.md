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

### Environment Variables

The `.env` file contains the database connection configuration:

- `DATABASE_URL`: PostgreSQL database connection URL

## Installation and Configuration

### Recommended Approach (with Docker)

Database initialization is now **automatic** thanks to the `db-init` service in the Docker Compose configuration.

1. **Start all services**:

   ```bash
   docker compose up --build
   ```

2. **The automatic process**:
   - The PostgreSQL database starts
   - Prisma migrations are applied automatically
   - The database is populated with test data
   - Prisma Studio is accessible at http://localhost:5555
   - The backend starts automatically

### Useful Commands

- **Restart initialization**: `docker compose restart db-init`
- **View initialization logs**: `docker compose logs db-init`
- **Access Prisma Studio**: http://localhost:5555

## Database Seeding

The seed script (`prisma/seed.ts`) automatically creates:

- Default roles (ADMIN, MANAGER, USER)
- Basic permissions
- Test company and domain
- Administrator user (admin@test.com / password123)

## Deprecated Commands

⚠️ The following manual commands are no longer necessary with automatic initialization:

```bash
# Deprecated commands (do not use anymore)
pnpm prisma migrate dev --name migration_name
pnpm prisma migrate deploy
pnpm db:seed
pnpm prisma studio
docker exec ... pnpm prisma:generate
```

The Docker Compose approach with dedicated services replaces all these manual commands.

## Using the Prisma Client

Import the Prisma client into your code via:

```typescript
import { prisma } from '../database/prismaClient';
```
