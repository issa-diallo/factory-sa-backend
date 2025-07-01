# 🏭 Factory Backend

Backend for the Factory application, developed with Node.js, Express, and TypeScript.

## 📋 Table of Contents

- [Technologies](#-technologies)
- [Installation](#-installation)
- [Available Scripts](#-available-scripts)
- [Tests](#-tests)
- [Project Structure](#-project-structure)
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

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm dev

# Build the project
pnpm build

# Start in production
pnpm start
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
- Production tests (`.prod.test.ts`)

### Test Commands

```bash
# Run all standard tests
pnpm test

# Run a specific production test
pnpm test -t tests/schemas/packingListSchema.prod.test.ts

# Run all production tests
pnpm test "tests/**/*.prod.test.ts"
```

## 📁 Project Structure

```
.
├── src/
│   ├── constants/     # Constants and configurations
│   ├── controllers/   # Express controllers
│   ├── routes/       # API routes
│   │   └── api/      # Versioned API routes
│   │       └── v1/   # API v1 routes
│   ├── schemas/      # Zod validation schemas
│   ├── services/     # Business logic
│   ├── types/        # TypeScript types and interfaces
│   └── utils/        # Utilities
├── tests/
│   ├── controllers/  # Controller tests
│   ├── fixtures/     # Test data
│   ├── schemas/      # Schema tests
│   └── utils/        # Utility tests
├── .eslintignore     # Files ignored by ESLint
├── .eslintrc.json    # ESLint configuration
├── .gitignore        # Files ignored by Git
├── .prettierignore   # Files ignored by Prettier
├── .prettierrc       # Prettier configuration
├── jest.config.js    # Jest configuration
├── package.json      # Project configuration
├── pnpm-lock.yaml    # Dependency version lock
├── README.md         # Main documentation
├── README-LINTING.md # Linting documentation
└── tsconfig.json     # TypeScript configuration
```

## 🔧 Linting and Formatting

The project uses ESLint and Prettier to maintain clean and consistent code. For more details on linting and formatting configuration, see [README-LINTING.md](README-LINTING.md).

## 📄 License

ISC
