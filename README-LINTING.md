# 🔧 ESLint & Prettier Setup

This document explains the ESLint and Prettier configuration implemented for this TypeScript project.

## 📋 Table of Contents

- [ESLint vs Prettier Differences](#eslint-vs-prettier-differences)
- [Configuration](#configuration)
- [Available Commands](#available-commands)
- [Usage](#usage)
- [VSCode Integration](#vscode-integration)
- [Custom Rules](#custom-rules)

## 🔍 ESLint vs Prettier Differences

### **ESLint** - Code Analyzer (Linter)
- **Role**: Detects code errors, quality issues, and rule violations
- **Focus**: Logic, best practices, potential errors, coding conventions
- **Examples**:
  - Unused variables
  - Always true/false conditions
  - Missing imports
  - Incorrect TypeScript types
  - Best practice violations

### **Prettier** - Code Formatter
- **Role**: Automatically formats code for consistent presentation
- **Focus**: Visual style, indentation, spacing, line length
- **Examples**:
  - Indentation (2 spaces)
  - Single vs double quotes
  - Trailing commas
  - Line breaks
  - Bracket spacing

## ⚙️ Configuration

### Configuration Files

```
.eslintrc.json      # ESLint configuration
.prettierrc         # Prettier configuration
.eslintignore       # Files ignored by ESLint
.prettierignore     # Files ignored by Prettier
.vscode/settings.json # VSCode integration (personal)
```

### Installed Dependencies

```json
{
  "devDependencies": {
    "eslint": "^8.57.1",
    "@typescript-eslint/parser": "^8.35.0",
    "@typescript-eslint/eslint-plugin": "^8.35.0",
    "prettier": "^3.6.2",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-prettier": "^5.5.1"
  }
}
```

## 🚀 Available Commands

### Linting (ESLint)

```bash
# Analyze and automatically fix issues
pnpm lint

# Check for issues without fixing
pnpm lint:check
```

### Formatting (Prettier)

```bash
# Format all code
pnpm format

# Check formatting without modifying
pnpm format:check
```

## 💡 Usage

### Recommended Workflow

1. **During development**:
   ```bash
   # Check for errors
   pnpm lint:check
   
   # Auto-fix issues
   pnpm lint
   ```

2. **Before committing**:
   ```bash
   # Format code
   pnpm format
   
   # Verify no errors remain
   pnpm lint:check
   ```

3. **In CI/CD pipeline**:
   ```bash
   # Check formatting
   pnpm format:check
   
   # Check linting rules
   pnpm lint:check
   ```

### Examples of Detected Issues

**ESLint will detect:**
```typescript
// ❌ Unused variable
const unusedVariable = 'hello';

// ❌ Explicit any type
function badFunction(param: any) { }

// ❌ Using var
var oldStyle = 'bad';
```

**Prettier will format:**
```typescript
// Before
const obj={name:"John",age:30};

// After
const obj = { name: 'John', age: 30 };
```

## 🎨 VSCode Integration

The `.vscode/settings.json` file configures:

- **Automatic formatting** on save
- **Automatic ESLint fixes** on save
- **Prettier** as default formatter
- **Real-time TypeScript** validation

### Recommended VSCode Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 📏 Custom Rules

### ESLint Configuration

```json
{
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## 🚫 Ignored Files

The following files are ignored by ESLint and Prettier:

- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `*.min.js`
- `pnpm-lock.yaml`
- `.vscode/`
- `.git/`

## 🔧 Customization

### Modify ESLint Rules

Edit `.eslintrc.json`:

```json
{
  "rules": {
    "new-rule": "error",
    "existing-rule": "off"
  }
}
```

### Modify Prettier Formatting

Edit `.prettierrc`:

```json
{
  "printWidth": 120,
  "singleQuote": false
}
```

## 🆘 Troubleshooting

### Common Errors

1. **"ESLint couldn't find the config"**
   - Check dependencies are installed: `pnpm install`

2. **"Prettier and ESLint conflicts"**
   - The `eslint-config-prettier` configuration automatically resolves conflicts

3. **"Files not being formatted"**
   - Check `.prettierignore` and `.eslintignore` files

### Diagnostic Commands

```bash
# Check ESLint configuration
npx eslint --print-config src/index.ts

# Check Prettier configuration
npx prettier --check src/index.ts --debug-check
```

## 🔄 Git Integration

### What to Commit

**✅ Include in Git:**
- `.eslintrc.json`
- `.prettierrc`
- `.eslintignore`
- `.prettierignore`
- `README-LINTING.md`

**❌ Keep in .gitignore:**
- `.vscode/` (personal editor settings)
- `node_modules/`
- `dist/` and `build/`

### Pre-commit Hook (Optional)

Consider adding a pre-commit hook:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm lint:check && pnpm format:check"
    }
  }
}
```

---

## 📚 Resources

- [ESLint Documentation](https://eslint.org/docs/)
- [Prettier Documentation](https://prettier.io/docs/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [ESLint + Prettier Integration](https://prettier.io/docs/en/integrating-with-linters.html)
