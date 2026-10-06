---
name: api-contract
description: API contract documentation - response envelope format, error structure, HTTP status codes, authentication, endpoint patterns, query parameters
user-invocable: false
---

# API Contract Documentation

Contract between Next.js frontend and Laravel backend API.

## Standard Response Envelope

See [../../.docs/practices/05-api-contract.md](../../.docs/practices/05-api-contract.md) for complete API contract.

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

### Error Response

```json
{
  "success": false,
  "message": "Email atau password salah",
  "errorCode": "INVALID_CREDENTIALS",
  "data": null,
  "errors": {
    "email": ["Email tidak valid"],
    "password": ["Minimal 8 karakter"]
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "currentPage": 1,
    "perPage": 20,
    "total": 145,
    "lastPage": 8
  },
  "links": {
    "first": "https://api.example.com/v1/items?page=1",
    "prev": null,
    "next": "https://api.example.com/v1/items?page=2"
  }
}
```

## HTTP Status Codes

| Code | Meaning | Retry? |
|------|---------|--------|
| 200 | Success | No |
| 201 | Created | No |
| 400 | Bad Request | No |
| 401 | Unauthorized | No |
| 403 | Forbidden | No |
| 404 | Not Found | No |
| 422 | Validation Error | No |
| 429 | Rate Limited | Yes |
| 500+ | Server Error | Yes |

## Authentication

**Bearer Token**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Token Endpoints**:
- `POST /v1/auth/login` → Returns user + token
- `POST /v1/auth/register` → Returns user + token
- `POST /v1/auth/refresh` → Returns new token
- `POST /v1/auth/logout` → Clears token

## Query Parameter Standards

All list endpoints support:

```
GET /v1/users?page=1&perPage=20&search=john&sortBy=name&sortOrder=asc&role=admin
```

| Parameter | Type | Example |
|-----------|------|---------|
| `page` | number | 1 (1-based) |
| `perPage` | number | 20 (max 100) |
| `search` | string | john |
| `sortBy` | string | name, email, createdAt |
| `sortOrder` | string | asc or desc |
| Domain-specific | string | role=admin, status=active |

## Endpoint Patterns

### List
```
GET /v1/users?page=1&perPage=20
→ {success, data[], meta, links}
```

### Get Single
```
GET /v1/users/:id
→ {success, data: {id, name, ...}}
```

### Create
```
POST /v1/users
{email, password, name, role}
→ {success, data: {...}} [201 Created]
```

### Update
```
PATCH /v1/users/:id
{email?, name?, role?}
→ {success, data: {...}} [200 OK]
```

### Delete
```
DELETE /v1/users/:id
→ {success, message: "...", data: null}
```

## Error Codes

| Code | HTTP | Meaning | Action |
|------|------|---------|--------|
| `VALIDATION_ERROR` | 422 | Invalid input | Show field errors |
| `INVALID_CREDENTIALS` | 401 | Wrong login | Show error message |
| `UNAUTHORIZED` | 401 | Not authenticated | Redirect to login |
| `FORBIDDEN` | 403 | No permission | Show access denied |
| `NOT_FOUND` | 404 | Resource missing | Show not found |
| `RATE_LIMITED` | 429 | Too many requests | Retry after delay |
| `SERVER_ERROR` | 500+ | Backend error | Show server error |

## Frontend-Backend Sync Points

1. **Response Envelope**: `{success, message, data, errors}` - frontend parses this exactly
2. **Error Messages**: Indonesian for user display - backend sends complete messages
3. **Date Format**: ISO 8601 UTC (e.g., `2024-01-15T10:30:00Z`) - frontend uses `new Date()`
4. **Field Names**: camelCase in JSON - `firstName`, not `first_name`
5. **Pagination**: `data[]` + `meta` + `links` - frontend expects all three
6. **Status Codes**: Match HTTP semantics - 200/201/4xx/5xx behavior predictable

## Testing the Contract

**Frontend Tests**:
```typescript
describe('getUsers', () => {
  it('returns paginated users', async () => {
    const response = await getUsers({ page: 1, perPage: 10 })
    expect(response).toHaveProperty('data')
    expect(response).toHaveProperty('meta')
    expect(response.meta).toHaveProperty('currentPage', 'perPage', 'total')
  })
})
```

**MSW Handlers**:
```typescript
// Must match backend format exactly
http.get('/v1/users', () => {
  return HttpResponse.json({
    success: true,
    data: [...],
    meta: {...},
    links: {...}
  })
})
```

## Versioning

**Current**: v1 (`/api/v1/`)

**Breaking Changes** → v2:
- Remove/rename field
- Change response format
- Change status code behavior
- Change parameter format

**Non-Breaking** → stay v1:
- New optional field
- New optional query parameter
- New endpoint
- New error code

## Update Process

When backend changes:
1. Notify frontend team
2. Update this document
3. Update MSW handlers
4. Add frontend tests

When frontend needs change:
1. Describe here
2. Create issue in backend repo
3. Link to this document
4. Wait for implementation

## See Also

- [Error Handling & Observability](../../.docs/practices/02-error-handling.md) — Handle API errors
- [Testing Strategy](../../.docs/practices/01-testing-strategy.md) — Test API integration
- [Security](../../.docs/practices/04-security.md) — Secure API calls
