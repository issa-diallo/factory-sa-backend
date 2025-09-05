# Company Access Control Middleware

This document explains the use of company access control middlewares to secure endpoints in a B2B context.

## 🎯 Objective

Ensure data isolation by company while allowing System Admins (role `ADMIN`) to have full access to the system.

## 🛡️ Available Middlewares

### 1. `requireOwnCompanyOrSystemAdmin()`

**Usage:** Automatic filtering by company, except for System Admins.

```typescript
import { requireOwnCompanyOrSystemAdmin } from '../middlewares/companyAccess';

router.get(
  '/',
  authenticate,
  authorize(['company:read']),
  requireOwnCompanyOrSystemAdmin(),
  companyController.getAllCompanies
);
```

**Behavior:**

- **System Admin (ADMIN):** Full access, no filtering
- **Other roles:** `req.companyFilter = { companyId: req.user.companyId }`

### 2. `requireOwnCompanyOnly()`

**Usage:** Enforces filtering by company for ALL users.

```typescript
import { requireOwnCompanyOnly } from '../middlewares/companyAccess';

router.get(
  '/sensitive-data',
  authenticate,
  authorize(['data:read']),
  requireOwnCompanyOnly(),
  dataController.getSensitiveData
);
```

**Behavior:**

- **All roles:** `req.companyFilter = { companyId: req.user.companyId }`

### 3. `validateCompanyAccess()`

**Usage:** Validates access to resources via route parameters.

```typescript
import { validateCompanyAccess } from '../middlewares/companyAccess';

router.get(
  '/:id',
  authenticate,
  authorize(['company:read']),
  validateCompanyAccess(),
  companyController.getCompanyById
);
```

**Behavior:**

- **System Admin:** Can access any company
- **Other roles:** Can only access their own company
- **403 Error** if attempting to access another company

### 4. `validateCompanyAccessInBody()`

**Usage:** Validates access to resources via the request body.

```typescript
import { validateCompanyAccessInBody } from '../middlewares/companyAccess';

router.put(
  '/:id',
  authenticate,
  authorize(['company:update']),
  validateCompanyAccessInBody(),
  companyController.updateCompany
);
```

**Behavior:**

- **System Admin:** Can modify any company
- **Other roles:** Can only modify their own company
- **403 Error** if attempting to modify another company

## 🔧 Usage in Services

The middlewares add `req.companyFilter` that services can use:

```typescript
// In a service
async getAllCompanies(req: Request): Promise<Company[]> {
    if (req.companyFilter?.companyId) {
        // Regular user: filter by their company
        return this.companyRepository.findMany({
            where: { id: req.companyFilter.companyId }
        });
    } else {
        // System Admin: return all companies
        return this.companyRepository.findMany();
    }
}
```

## 📋 Application Examples

### Complete Company Routes

```typescript
// src/routes/api/v1/company.ts
import {
  requireOwnCompanyOrSystemAdmin,
  validateCompanyAccess,
  validateCompanyAccessInBody,
} from '../../../middlewares/companyAccess';

// Creation: validate companyId in the body
router.post(
  '/',
  authenticate,
  authorize(['company:create']),
  validateCompanyAccessInBody(),
  companyController.create
);

// List: automatic filtering
router.get(
  '/',
  authenticate,
  authorize(['company:read']),
  requireOwnCompanyOrSystemAdmin(),
  companyController.getAllCompanies
);

// Current company: no filtering needed
router.get(
  '/current',
  authenticate,
  authorize(['company:read']),
  companyController.getCurrentCompany
);

// By ID: validate access
router.get(
  '/:id',
  authenticate,
  authorize(['company:read']),
  validateCompanyAccess(),
  companyController.getCompanyById
);

// Update: validate parameter AND body
router.put(
  '/:id',
  authenticate,
  authorize(['company:update']),
  validateCompanyAccess(),
  validateCompanyAccessInBody(),
  companyController.updateCompany
);

// Deletion: validate access
router.delete(
  '/:id',
  authenticate,
  authorize(['company:delete']),
  validateCompanyAccess(),
  companyController.deleteCompany
);
```

## 🎯 Use Cases

### Scenario 1: System Admin

```typescript
// User: admin@test.com (role ADMIN)
// GET /api/v1/company
// → Returns ALL companies (no filtering)

// GET /api/v1/company/any-company-id
// → Access allowed to any company
```

### Scenario 2: Company Manager

```typescript
// User: manager@company123.com (role MANAGER, companyId: company-123)
// GET /api/v1/company
// → req.companyFilter = { companyId: 'company-123' }
// → Returns only company-123

// GET /api/v1/company/company-456
// → 403 Error (attempt to access another company)

// GET /api/v1/company/company-123
// → Access allowed (their own company)
```

### Scenario 3: Standard User

```typescript
// User: user@company789.com (role USER, companyId: company-789)
// GET /api/v1/company/current
// → Returns company-789

// PUT /api/v1/company/company-789 { companyId: 'company-456' }
// → 403 Error (attempt to modify another company)
```

## 🔒 Security

These middlewares ensure:

- **Data isolation** by company
- **Privileged access** for System Admins
- **Strict validation** of cross-company access attempts
- **Transparency** for developers (via `req.companyFilter`)

## 🧪 Tests

All middlewares are covered by comprehensive unit tests in:

- `tests/middlewares/companyAccess.test.ts`
- `tests/controllers/companyController.getCurrentCompany.test.ts`
