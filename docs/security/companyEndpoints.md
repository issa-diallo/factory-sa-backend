# Company Endpoints Security Guide

This document details the complete security architecture of the Company endpoints, implemented to ensure B2B data isolation.

## 🛡️ Security Architecture (4 Layers)

### **Layer 1: Authentication**

- **Middleware:** `authenticate`
- **Function:** JWT validation and session verification
- **Failure:** 401 Unauthorized

### **Layer 2: Authorization**

- **Middleware:** `authorize(['permission'])`
- **Function:** Permission checks per action
- **Failure:** 403 Forbidden

### **Layer 3: Company Filtering**

- **Middlewares:** `requireOwnCompanyOrSystemAdmin()`, `validateCompanyAccess()`, `validateCompanyAccessInBody()`
- **Function:** B2B data isolation
- **Failure:** 403 Forbidden (cross-company access)

### **Layer 4: Data Validation**

- **Schemas:** Zod schemas (`createCompanySchema`, `updateCompanySchema`)
- **Function:** Input validation and sanitization
- **Failure:** 400 Bad Request

## 🎯 Access Control Matrix

| Endpoint       | ADMIN  | MANAGER | USER   | Security Middleware                                         |
| -------------- | ------ | ------- | ------ | ----------------------------------------------------------- |
| `POST /`       | ✅ All | ✅ Own  | ❌     | `validateCompanyAccessInBody()`                             |
| `GET /`        | ✅ All | ✅ Own  | ✅ Own | `requireOwnCompanyOrSystemAdmin()`                          |
| `GET /current` | ✅ Own | ✅ Own  | ✅ Own | None (secured by design)                                    |
| `GET /:id`     | ✅ All | ✅ Own  | ✅ Own | `validateCompanyAccess()`                                   |
| `PUT /:id`     | ✅ All | ✅ Own  | ❌     | `validateCompanyAccess()` + `validateCompanyAccessInBody()` |
| `DELETE /:id`  | ✅ All | ❌      | ❌     | `validateCompanyAccess()`                                   |

## 🔒 Security Features

### **Automatic Company Filtering**

```typescript
// System Admin (ADMIN)
req.companyFilter = undefined → Access to all companies

// Regular User (MANAGER/USER)
req.companyFilter = { companyId: req.user.companyId } → Limited to their own company
```

### **Cross-Company Access Validation**

```typescript
// Route parameters
GET /api/v1/company/other-company-id → 403 if not System Admin

// Request body
PUT /api/v1/company/id { companyId: "other-company" } → 403 if not System Admin
```

### **Granular Permissions**

- `company:create` - Create companies
- `company:read` - Read company data
- `company:update` - Update companies
- `company:delete` - Delete companies

## 🚨 Security Error Handling

### **401 Unauthorized**

```json
{
  "message": "Authentication required"
}
```

**Causes:** Missing, invalid, or expired token

### **403 Forbidden**

```json
{
    "message": "Insufficient permission"
}
// OR
{
    "message": "Access denied: cannot access other company data"
}
// OR
{
    "message": "Access denied: cannot modify other company data"
}
```

**Causes:** Insufficient permissions or cross-company access attempt

### **400 Bad Request**

```json
{
    "message": "User company not found"
}
// OR
{
    "message": "Invalid validation data"
}
```

**Causes:** Invalid data or user without a company

### **404 Not Found**

```json
{
  "message": "Company not found"
}
```

**Causes:** Nonexistent or inaccessible company

## 🔧 Middleware Usage

### **For Automatic Filtering**

```typescript
router.get(
  '/',
  authenticate,
  authorize(['company:read']),
  requireOwnCompanyOrSystemAdmin(), // ✅ Automatic filtering
  companyController.getAllCompanies
);
```

### **For Parameter Validation**

```typescript
router.get(
  '/:id',
  authenticate,
  authorize(['company:read']),
  validateCompanyAccess(), // ✅ Validates :id parameter
  companyController.getCompanyById
);
```

### **For Body Validation**

```typescript
router.put(
  '/:id',
  authenticate,
  authorize(['company:update']),
  validateCompanyAccess(), // ✅ Validates :id parameter
  validateCompanyAccessInBody(), // ✅ Validates request body
  companyController.updateCompany
);
```

## 🎯 Role-Based Behavior

### **System Admin (ADMIN)**

- **Access:** All companies without restriction
- **Filtering:** None (`req.companyFilter = undefined`)
- **Permissions:** All actions allowed
- **Use Case:** Global system administration

### **Company Manager (MANAGER)**

- **Access:** Only their own company
- **Filtering:** Automatic (`req.companyFilter = { companyId }`)
- **Permissions:** Read, create, update their company
- **Use Case:** Managing their company

### **Standard User (USER)**

- **Access:** Only their own company (read-only)
- **Filtering:** Automatic (`req.companyFilter = { companyId }`)
- **Permissions:** Read-only
- **Use Case:** Viewing their company information

## 🔐 Security Guarantees

### **B2B Data Isolation**

- ✅ No user can view other companies' data
- ✅ No user can modify other companies' data
- ✅ System Admins retain global access for administration

### **Protection Against Attacks**

- ✅ **Parameter Tampering:** `validateCompanyAccess()` blocks attempts
- ✅ **Body Injection:** `validateCompanyAccessInBody()` validates data
- ✅ **Permission Escalation:** `authorize()` checks permissions
- ✅ **Token Manipulation:** `authenticate` validates integrity

### **B2B Compliance**

- ✅ **Data Residency:** Each company accesses only its data
- ✅ **Access Control:** Role-based access control
- ✅ **Audit Trail:** Ready for future integration (Sentry)

## 🚀 Future Extensions

### **Ready for:**

- **Pagination** - Structure in place for easy addition
- **Audit Logs** - Architecture compatible with Sentry
- **Business Validation** - Hooks available in controllers
- **Caching** - Filtering compatible with caching

### **Reusable Model:**

This security architecture can be applied to other resources:

- Users/UserManagement
- Packing Lists
- Domains
- Any resource requiring B2B isolation

## ✅ Complete Validation

The Company security model is **COMPLETE and OPERATIONAL** with:

- 🛡️ Multi-layered security
- 🎯 Guaranteed B2B isolation
- 🧪 Comprehensive tests (35 tests)
- 📚 Exhaustive documentation
- 🚀 Production-ready
