# 🏭 Factory Backend

Backend for the Factory application, developed with Node.js, Express, and TypeScript.

## 📋 Table of Contents

- [Technologies](#-technologies)
- [Installation](#-installation)
- [Docker Installation](#-docker-installation)
- [Available Scripts](#-available-scripts)
- [Tests](#-tests)
- [Project Structure](#-project-structure)
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

To run the application using Docker Compose, make sure you have Docker Desktop (or Docker Engine) installed on your machine.

1.  **Clone the repository** (if not already done):

    ```bash
    git clone git@github.com:issa-diallo/factory-sa-backend.git
    cd factory-sa-backend
    ```

2.  **Launch the application with Docker Compose**:
    This command will build the Docker image (if it doesn't exist or if the `Dockerfile` has been modified) and start the container.

    ```bash
    docker compose up --build
    ```

    The application will be accessible at `http://localhost:3001`.

3.  **Run in background (detached mode)**:
    To run the application in the background and free up your terminal:

    ```bash
    docker compose up -d
    ```

4.  **Stop the application**:
    To stop and remove the containers:
    ```bash
    docker compose down
    ```
    If you just want to stop the containers without removing them:
    ```bash
    docker compose stop
    ```

## 🛠️ Development Configuration

To set up your development environment with Docker Compose:

1.  **Copy the override example file**:
    This file contains development-specific configurations that override default settings.

    ```bash
    cp docker-compose.override.yml.example docker-compose.override.yml
    ```

2.  **Launch the application in development mode**:
    Docker Compose will automatically detect the `docker-compose.override.yml` file and apply development configurations.

    ```bash
    docker-compose up
    ```

    The application will be accessible at `http://localhost:3001` and code changes will be hot-reloaded.

3.  **For Production**:
    If you wish to run the application in production mode (e.g., for a local test deployment), ensure that the `docker-compose.override.yml` file is not present or rename it. Then, use the standard command:

    ```bash
    docker-compose up
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

## 🧪 Tests

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
