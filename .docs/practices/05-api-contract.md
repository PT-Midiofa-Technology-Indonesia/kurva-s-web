# API Contract Documentation

Document the contract between Next.js frontend and Laravel backend.

---

## API Overview

**Base URL**: `http://localhost:8000/api/v1` (development)

**Production**: `https://api.example.com/api/v1`

**Client**: Next.js 16 frontend
**Server**: Laravel backend
**Format**: JSON
**Auth**: JWT (Bearer token in Authorization header)

---

## Standard Response Envelope

### Success Response

```json
{
  "success": true,
  "message": "OK or user-friendly message",
  "data": {
    "id": "uuid",
    "name": "Example",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "currentPage": 1,
    "perPage": 20,
    "total": 145,
    "lastPage": 8,
    "from": 1,
    "to": 20
  },
  "links": {
    "first": "https://api.example.com/v1/items?page=1",
    "last": "https://api.example.com/v1/items?page=8",
    "prev": null,
    "next": "https://api.example.com/v1/items?page=2"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "User-friendly error message in Indonesian",
  "errorCode": "VALIDATION_ERROR",
  "data": null,
  "errors": {
    "email": ["Email harus valid"],
    "password": ["Minimal 8 karakter"]
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Retry? | Example |
|---|---|---|---|
| 200 | Success | No | GET, PATCH, DELETE |
| 201 | Created | No | POST (create) |
| 400 | Bad Request | No | Invalid JSON |
| 401 | Unauthorized | No | Missing/invalid token |
| 403 | Forbidden | No | No permission |
| 404 | Not Found | No | Resource doesn't exist |
| 422 | Validation Error | No | Invalid input data |
| 429 | Rate Limited | Yes | Too many requests |
| 500 | Server Error | Yes | Backend exception |
| 503 | Unavailable | Yes | Maintenance |

---

## Authentication

### Token-Based (Bearer Token)

```typescript
// Request
GET /v1/users HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response
200 OK
[
  { "id": "1", "name": "User 1" },
  { "id": "2", "name": "User 2" }
]
```

### Get Token

```typescript
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

### Refresh Token

```typescript
POST /v1/auth/refresh
Authorization: Bearer <current_token>

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

### Logout

```typescript
POST /v1/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{}

// Response
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## Endpoints

### Authentication

#### Login
```
POST /v1/auth/login
```

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "admin|manager|user"
    },
    "token": "string",
    "expiresIn": 3600
  }
}
```

**Errors**:
- `401`: Invalid credentials
- `422`: Validation error

---

#### Register
```
POST /v1/auth/register
```

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "New User"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "string"
  }
}
```

**Errors**:
- `422`: Validation error (email taken, weak password)

---

### Users

#### List Users
```
GET /v1/users?page=1&perPage=20&search=john&sortBy=name&sortOrder=asc
```

**Query Parameters**:
- `page` (number): Page number (1-based)
- `perPage` (number): Items per page (max 100)
- `search` (string): Search by name/email
- `sortBy` (string): Sort column (name, email, createdAt)
- `sortOrder` (string): asc or desc

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "admin|manager|user",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": { ... },
  "links": { ... }
}
```

---

#### Get User
```
GET /v1/users/:id
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "admin|manager|user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors**:
- `404`: User not found

---

#### Create User
```
POST /v1/users
```

**Request**:
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "user",
  "password": "Password123!"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Errors**:
- `422`: Validation error (email taken, weak password)
- `403`: No permission

---

#### Update User
```
PATCH /v1/users/:id
```

**Request** (all optional):
```json
{
  "email": "newemail@example.com",
  "name": "Updated Name",
  "role": "manager"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Errors**:
- `404`: User not found
- `422`: Validation error
- `403`: No permission

---

#### Delete User
```
DELETE /v1/users/:id
```

**Response (200)**:
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

**Errors**:
- `404`: User not found
- `403`: No permission

---

## Query Parameter Standards

All list endpoints follow this pattern:

### Pagination
- `page` (int): 1-based page number, default 1
- `perPage` (int): Items per page, default 20, max 100

### Sorting
- `sortBy` (string): Column name to sort by
- `sortOrder` (string): `asc` or `desc`, default `asc`

### Filtering
- `search` (string): Free-text search (name, email, etc.)
- Domain-specific filters (status, role, dateFrom, dateTo, etc.)

### Example
```
GET /v1/users?page=2&perPage=50&search=john&sortBy=createdAt&sortOrder=desc&role=admin
```

---

## Error Code Reference

| Code | HTTP | Meaning | Action |
|---|---|---|---|
| `VALIDATION_ERROR` | 422 | Invalid input | Show validation errors |
| `INVALID_CREDENTIALS` | 401 | Wrong login | Show "Invalid email or password" |
| `UNAUTHORIZED` | 401 | Not authenticated | Redirect to login |
| `FORBIDDEN` | 403 | Not authorized | Show "Access denied" |
| `NOT_FOUND` | 404 | Resource missing | Show "Not found" |
| `CONFLICT` | 409 | Resource exists | Show specific error |
| `RATE_LIMITED` | 429 | Too many requests | Retry after delay |
| `SERVER_ERROR` | 500+ | Backend error | Show "Server error" |

---

## Frontend ↔ Backend Sync Points

### Important Contracts

1. **Response Envelope**: Frontend expects `{success, message, data, errors}`
   - Backend must always return this format
   - Frontend parses with error extractors

2. **Error Messages**: Messages in **Indonesian** for user display
   - Backend sends user-friendly messages
   - Frontend shows directly in UI

3. **Date Format**: ISO 8601 UTC (e.g., `2024-01-15T10:30:00Z`)
   - Frontend parses with `new Date()`
   - Backend sends in UTC

4. **Field Names**: camelCase in JSON
   - `firstName`, not `first_name`
   - `createdAt`, not `created_at`

5. **Pagination**: Meta + data format
   - Frontend expects `data: []` + `meta: {currentPage, perPage, total}`
   - Backend sends consistent structure

6. **Status Codes**: Always match HTTP semantics
   - 200 for success (no data change)
   - 201 for creation
   - 4xx for client errors
   - 5xx for server errors

---

## Testing the Contract

### Frontend Tests

```typescript
// Test assumes API contract
describe('getUsers API', () => {
  it('returns paginated users', async () => {
    const response = await getUsers({ page: 1, perPage: 10 })
    
    expect(response).toHaveProperty('resources')
    expect(response).toHaveProperty('meta')
    expect(response.meta).toHaveProperty('currentPage', 'perPage', 'total')
  })
})
```

### Shared Test Data

```typescript
// src/mocks/handlers.ts
// Mock handlers must match backend format exactly

http.get('/v1/users', () => {
  return HttpResponse.json({
    success: true,
    data: [...],
    meta: {...}
  })
})
```

---

## Versioning Strategy

### Current Version: v1

- Endpoint prefix: `/api/v1/`
- Breaking changes → v2
- Non-breaking additions → stay in v1

### Breaking Changes

Changes that require `v2`:
- Remove/rename field
- Change response format
- Change status code behavior
- Change parameter format

### Non-Breaking Additions

OK to add in `v1`:
- New optional field in response
- New optional query parameter
- New endpoint
- New error code

---

## API Documentation

### Update Process

When backend changes API:
1. Notify frontend team
2. Update this document
3. Add migration notes if breaking
4. Update MSW handlers in tests
5. Add frontend tests for new behavior

When frontend needs API change:
1. Describe needed changes here
2. Create issue in backend repo
3. Link to this document
4. Wait for backend implementation

---

## See Also

- [Testing Strategy](01-testing-strategy.md) — Test API integration
- [Error Handling](02-error-handling.md) — Handle API errors
- [CLAUDE.md](../CLAUDE.md) — Architecture
