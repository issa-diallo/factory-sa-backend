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

### 1. Manual Installation (on your machine)

If you run the application directly on your machine (without Docker):

1. Ensure PostgreSQL is installed and running on your machine.
2. Temporarily modify `DATABASE_URL` in `.env` to use `localhost` instead of `db`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
   ```
3. Execute Prisma commands directly:

   ```bash
   # Generate Prisma client
   pnpm prisma:generate

   # Create a migration
   pnpm prisma migrate dev --name migration_name

   # Apply migrations
   pnpm prisma migrate deploy

   # Seed the database
   pnpm db:seed

   # Launch Prisma Studio
   pnpm prisma studio
   ```

### 2. Docker Installation (recommended)

If you use Docker (recommended method):

1. Start Docker containers:

   ```bash
   docker compose up -d
   ```

2. Execute Prisma commands within the Docker container:

   ```bash
   # Generate Prisma client
   docker exec factory-backend-backend-1 pnpm prisma:generate

   # Create a migration
   docker exec factory-backend-backend-1 pnpm prisma migrate dev --name migration_name

   # Apply migrations
   docker exec factory-backend-backend-1 pnpm prisma migrate deploy

   # Seed the database
   docker exec factory-backend-backend-1 pnpm db:seed
   ```

3. For Prisma Studio, use the configured script that exposes port 5555:
   ```bash
   pnpm prisma:studio:docker
   ```
   Prisma Studio will be accessible at http://localhost:5555 in your browser.

## Database Seeding

The project includes a seed script (`prisma/seed.ts`) that initializes the database with essential data:

- Default user roles (ADMIN, MANAGER, USER)
- Basic permissions
- Test company and domain
- Admin user

## Useful Commands

### With Docker (recommended)

- **Start the application with the database**: `docker compose up -d`
- **Generate Prisma client**: `docker exec factory-backend-backend-1 pnpm prisma:generate`
- **Create a migration**: `docker exec factory-backend-backend-1 pnpm prisma migrate dev --name migration_name`
- **Apply migrations**: `docker exec factory-backend-backend-1 pnpm prisma migrate deploy`
- **Seed the database**: `docker exec factory-backend-backend-1 pnpm db:seed`
- **Visualize the database**: `pnpm prisma:studio:docker`

### Without Docker (local installation)

- **Generate Prisma client**: `pnpm prisma:generate`
- **Create a migration**: `pnpm prisma migrate dev --name migration_name`
- **Apply migrations**: `pnpm prisma migrate deploy`
- **Seed the database**: `pnpm db:seed`
- **Visualize the database**: `pnpm prisma studio`

## Using the Prisma Client

Import the Prisma client into your code via:

```typescript
import { prisma } from '../database/prismaClient';
```
