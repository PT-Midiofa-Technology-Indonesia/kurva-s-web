---
name: error-handling
description: Error handling & observability - API error extraction, form errors, error boundaries, Sentry integration, structured logging, web vitals tracking
user-invocable: false
---

# Error Handling & Observability

Complete error handling strategy from API errors to user display and monitoring.

## Error Flow

See [../../.docs/practices/02-error-handling.md](../../.docs/practices/02-error-handling.md) for:
- **Error Response Format**: `{success, message, errorCode, errors}` from backend
- **Error Extraction**: `getErrorMessage()`, `getErrorCode()`, `getFieldErrors()`, `getStatusCode()`
- **API Layer**: Try/catch that throws structured errors
- **Form Layer**: `form.setError()` with field-specific messages
- **Mutation Layer**: `useMutation` with `onError` showing toasts
- **Query Layer**: Error boundaries showing alerts with retry buttons

## Error Extractor Functions

```typescript
// src/shared/lib/api-error.ts
getErrorMessage(error)        // Returns Indonesian user-friendly message
getErrorCode(error)           // Returns error code for conditional logic
getFieldErrors(error)         // Returns Record<fieldName, string[]>
getStatusCode(error)          // Returns HTTP status
isValidationError(error)      // Checks if 422
isAuthError(error)            // Checks if 401
isForbiddenError(error)       // Checks if 403
isNotFoundError(error)        // Checks if 404
```

## Form Error Handling

```typescript
// In hook: extract and set errors
onError: (error) => {
  const fieldErrors = getFieldErrors(error)
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    form.setError(field, { message: messages[0] })
  })
  toast.error(getErrorMessage(error))
}
```

## Mutation Error Handling

```typescript
// Show toast for delete/update operations
onError: (error) => {
  toast.error(`Failed: ${getErrorMessage(error)}`)
}
```

## Query Error Handling

```typescript
// Show alert for list/detail pages
if (isError) {
  return <Alert>{getErrorMessage(error)}</Alert>
}
```

## Error Boundaries

```typescript
// Global boundary wrapping app
<ErrorBoundary>
  <Router />
</ErrorBoundary>

// Route boundary in app/error.tsx
export default function Error({ error, reset }) {
  // Logs to Sentry, renders fallback UI
}
```

## Sentry Integration

```typescript
// Automatic capturing in error boundaries
captureException(error, {
  tags: { operation: 'user_creation' },
  contexts: { payload: { email, name } }
})

// Manual message capturing
captureMessage('User logged in', 'info')
```

## Structured Logging

```typescript
logger.info('User created', { userId: user.id })
logger.warn('API response slow', { endpoint: '/v1/users', duration: 5000 })
logger.error('Failed to fetch', error, { retryAttempt: 3 })
```

## Web Vitals Monitoring

Track Core Web Vitals and report to Sentry:
- **CLS** (Cumulative Layout Shift) < 0.1
- **FID** (First Input Delay) < 100ms
- **LCP** (Largest Contentful Paint) < 2.5s
- **TTFB** (Time to First Byte)

## Error Code Reference

| Code | HTTP | Action |
|------|------|--------|
| `VALIDATION_ERROR` | 422 | Show field errors |
| `INVALID_CREDENTIALS` | 401 | Show "Invalid email or password" |
| `UNAUTHORIZED` | 401 | Redirect to login |
| `FORBIDDEN` | 403 | Show "Access denied" |
| `NOT_FOUND` | 404 | Show "Not found" |
| `SERVER_ERROR` | 500+ | Show "Server error, try again" |

## Key Principles

1. **Never log sensitive data** - No passwords, tokens, SSN, credit cards
2. **User-friendly messages** - Display Indonesian, informative but safe
3. **Backend validates** - Frontend hides UI, backend still checks
4. **Errors are data** - Handle with same rigor as success case
5. **Monitor in production** - Sentry catches what you missed

## See Also

- [API Contract Documentation](../../.docs/practices/05-api-contract.md) — Error response format
- [Testing Strategy](../../.docs/practices/01-testing-strategy.md) — Test error scenarios
