# 🏠 Factory Backend

Backend for the Factory application, developed with Node.js, Express, and TypeScript.

## 📋 Table of Contents

- [Technologies](#-technologies)
- [Installation](#-installation)
- [Docker Installation](#-docker-installation)
- [Available Scripts](#-available-scripts)
- [Tests](#-tests)
- [Project Structure](#-project-structure)
- [Architecture Overview](#-architecture-overview)
- [Database (Prisma & PostgreSQL)](#-database-prisma--postgresql)
- [Linting and Formatting](#-linting-and-formatting)

## 🚀 Technologies

- **Runtime:** Node.js
- **Framework:** Express 4.21
- **Language:** TypeScript
- **Validation:** Zod
- **Excel Processing:** xlsx
- **Testing:** Jest
- **Package Manager:** pnpm

## 💻 Installation

There are two main ways to set up and run this project:

1.  **Manual Installation**: Follow the steps below to install dependencies and run the application directly on your machine.
2.  **Docker Installation**: Use Docker Compose for a containerized setup (recommended for consistency and ease of deployment). Refer to the [Docker Installation](#-docker-installation) section.

Choose the method that best suits your development environment.

To set up the project locally, follow these steps for manual installation:

1.  **Clone the repository**:

    ```bash
    git clone git@github.com:issa-diallo/factory-sa-backend.git
    ```

2.  **Navigate to the project directory**:

    ```bash
    cd factory-sa-backend
    ```

3.  **Install dependencies**:
    Make sure you have `pnpm` installed. If not, you can install it globally:

    ```bash
    npm install -g pnpm
    ```

    Then, install the project dependencies:

    ```bash
    pnpm install
    ```

4.  **Start in development mode**:

    ```bash
    pnpm dev
    ```

5.  **Build the project** (for production deployment):

    ```bash
    pnpm build
    ```

6.  **Start in production** (after building):
    ```bash
    pnpm start
    ```

## 🐳 Docker Installation

To launch the application with automatic database initialization:

1. **Clone the repository**:

   ```bash
   git clone git@github.com:issa-diallo/factory-sa-backend.git
   cd factory-sa-backend
   ```

2. **Start all services**:

   ```bash
   docker compose up --build
   ```

   This command will:
   - Start the PostgreSQL database
   - Run Prisma migrations
   - Populate the database with test data
   - Launch Prisma Studio at http://localhost:5555
   - Start the backend server

3. **Access the services**:
   - Backend: http://localhost:3001
   - Prisma Studio: http://localhost:5555
   - Database: port 5432

## 🛠️ Development Configuration

1. **Copy the development configuration file**:

   ```bash
   cp docker-compose.override.yml.example docker-compose.override.yml
   ```

   The file now includes:
   - A database initialization service
   - Integrated Prisma Studio
   - Hot-reload for code changes

2. **Useful commands**:

   ```bash
   # Restart a specific service
   docker compose restart backend

   # View logs
   docker compose logs -f

   # Clean everything
   docker compose down -v
   ```

## 📜 Available Scripts

- `pnpm dev`: Start the server in development mode with hot-reload
- `pnpm start`: Start the server in production mode
- `pnpm build`: Compile the TypeScript project
- `pnpm build:watch`: Compile the project in watch mode
- `pnpm test`: Run all tests
- `pnpm test:watch`: Run tests in watch mode
- `pnpm test:coverage`: Run tests with coverage
- `pnpm lint`: Fix linting errors
- `pnpm format`: Format the code

## 🤪 Architecture Overview

The backend follows a **modular architecture** combining:

### ✅ Repository Pattern

Each domain has an interface (e.g., `ICompanyRepository`) and a concrete implementation (e.g., `PrismaCompanyRepository`) to abstract Prisma operations.

### ✅ Dependency Injection (with `tsyringe`)

All dependencies are injected using the `@injectable()` and `@inject()` decorators, enabling loose coupling and easy mocking for tests.

### 🟦 Vercel Deployment

The application is configured for deployment on Vercel with optimal bundling for serverless functions.

### Prerequisites

- Vercel CLI installed (`npm install -g vercel`)
- GitHub repository connected to Vercel

### Build & Deployment Commands

```bash
# Install dependencies
pnpm install

# Local build test (creates dist/ directory)
pnpm build:vercel

# Deploy to preview environment
vercel --yes

# Deploy to production
vercel --prod

# One-click deploy script (includes DB migration)
pnpm deploy:prod

# Check deployment status
vercel ls
vercel logs
```

### Build Configuration

The project uses **esbuild** for fast serverless bundling:

- **Entry point**: `api/index.ts`
- **Bundle output**: `dist/api/index.js` (~1.9MB)
- **Platform**: Node.js 20.x
- **External dependencies**: `@prisma/client` (handled separately)

### Environment Variables

Configure these in your Vercel dashboard (`Project Settings > Environment Variables`):

```bash
# Database & Prisma
DATABASE_URL=your_postgresql_connection_string

# JWT Security
JWT_SECRET=your_jwt_secret

# Authentication
AUTH_SECRET=your_auth_secret

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://staging.your-domain.com

# Supabase (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Troubleshooting

**Function Invocation Failed (`ERR_MODULE_NOT_FOUND`)**:

- This usually indicates a build/bundle issue
- Run `pnpm build:vercel` locally to test
- Check Vercel logs: `vercel logs --follow`

**Protection Bypass**:

- Preview deployments require authentication
- Use bypass token in URL or dashboard settings
- Production deployments are public once approved

## ✅ Service Layer

Services encapsulate the business logic and orchestrate calls to the repositories. Example: `CompanyService`, `AuthService`.

### 📆 Inspired by Clean Architecture

Although not fully DDD or hexagonal, the structure aligns with Clean Architecture principles:

- Separation of concerns
- Inversion of control
- Testable and pluggable modules

**Layers**:

- `controllers/` — HTTP handlers
- `services/` — business logic
- `repositories/` — data persistence layer
- `types/`, `schemas/`, `utils/` — shared concerns

## 🕰️ Tests

The project uses Jest for testing. Test files are organized into two categories:

- Standard tests (`.test.ts`)

### Test Commands

```bash
# Run all standard tests
pnpm test

# Run a specific production test
pnpm test -t tests/schemas/packingListSchema.prod.test.ts

# Run all production tests in local
pnpm test "tests/**/*.prod.test.ts"

# --- Docker Test Commands ---

# Run all tests inside the backend container
docker compose exec backend pnpm test

# Run a specific test file inside the backend container
docker compose exec backend pnpm test tests/controllers/userManagementController.test.ts
```

## 🗄️ Database (Prisma & PostgreSQL)

The project uses PostgreSQL as the database and Prisma as the ORM (Object-Relational Mapping) tool. This combination provides:

- Type-safe database queries with TypeScript
- Simplified database schema management
- Automatic migrations
- Efficient data validation

For more details on the database setup and usage, see [README-PRISMA.md](README-PRISMA.md).

## 🔧 Linting and Formatting

The project uses ESLint and Prettier to maintain clean and consistent code. For more details on linting and formatting configuration, see [README-LINTING.md](README-LINTING.md).

## 📄 License

ISC
