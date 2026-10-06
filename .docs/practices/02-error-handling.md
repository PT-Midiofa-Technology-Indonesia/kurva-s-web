# Error Handling & Observability

Complete error handling and observability strategy for Curva Frontend.

---

## Error Handling Flow

```
Frontend Error
    ↓
Try/Catch or Error Boundary
    ↓
Extract: Message, Code, FieldErrors
    ↓
Log (console, Sentry, file)
    ↓
Display to User (form.setError, toast, alert)
    ↓
Track (error metrics, analytics)
```

---

## API Layer Error Handling

### Standard Error Response (from Laravel)

```json
{
  "success": false,
  "message": "Email atau password salah",
  "errorCode": "INVALID_CREDENTIALS",
  "data": null,
  "errors": {
    "email": ["Email tidak valid"],
    "password": ["Minimal 6 karakter"]
  }
}
```

### API Function Pattern

```typescript
// src/domains/user/api/create-user.ts
import api from '@/shared/lib/axios'
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api'
import { createUserSchema } from '../schemas'

export async function createUser(payload: CreateUserPayload): Promise<User> {
  // Validate locally first
  const validated = createUserSchema.parse(payload)

  try {
    const { data } = await api.post<ApiSuccessResponse<User>>(
      '/v1/users',
      validated
    )
    return data.data
  } catch (error) {
    // Axios automatically throws on error status codes
    throw new Error(
      error instanceof Error
        ? `Failed to create user: ${error.message}`
        : 'Failed to create user'
    )
  }
}
```

---

## Error Extractors

### Core Error Helpers

```typescript
// src/shared/lib/api-error.ts
import axios, { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Extract user-facing message from any error
 * Returns Indonesian message safe to display in UI
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    return data?.message || error.message || 'Terjadi kesalahan'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Terjadi kesalahan'
}

/**
 * Extract error code for conditional logic
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    return data?.errorCode
  }

  return undefined
}

/**
 * Extract field-specific validation errors
 * Returns Record<fieldName, messages[]>
 */
export function getFieldErrors(
  error: unknown
): Record<string, string[]> {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    return data?.errors || {}
  }

  return {}
}

/**
 * Get HTTP status code
 */
export function getStatusCode(error: unknown): number | undefined {
  if (error instanceof AxiosError) {
    return error.response?.status
  }

  return undefined
}

/**
 * Check if error is specific type
 */
export function isValidationError(error: unknown): boolean {
  return getStatusCode(error) === 422
}

export function isAuthError(error: unknown): boolean {
  return getStatusCode(error) === 401
}

export function isForbiddenError(error: unknown): boolean {
  return getStatusCode(error) === 403
}

export function isNotFoundError(error: unknown): boolean {
  return getStatusCode(error) === 404
}
```

---

## Form Error Handling

### React Hook Form Integration

```typescript
// src/domains/user/hooks/use-create-user-form.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createUser } from '../api/create-user'
import { createUserSchema } from '../schemas'
import {
  getErrorMessage,
  getFieldErrors,
  isValidationError,
} from '@/shared/lib/api-error'
import { toast } from '@/shared/lib/toast'

export function useCreateUserForm() {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: 'onBlur', // Validate on blur for better UX
  })

  const { mutate: submit, isPending } = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Success handling
      toast.success({ title: 'User created successfully' })
      form.reset()
      // Navigate or callback
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      const fieldErrors = getFieldErrors(error)

      // Set general error
      if (!isValidationError(error)) {
        form.setError('root', { message })
        toast.error({ title: message })
        return
      }

      // Set field-specific errors
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        form.setError(field as any, {
          message: messages[0], // Use first error message
        })
      })

      // Also show toast for visibility
      toast.error({ title: message })
    },
  })

  return {
    form,
    onSubmit: form.handleSubmit(submit),
    isPending,
  }
}
```

### Form Component

```typescript
// src/domains/user/components/CreateUserForm.tsx
import { useFormContext } from 'react-hook-form'
import { FormGenerator } from '@/shared/components/molecules/FormGenerator'
import { USER_FORM_FIELDS, USER_FORM_LABELS } from '../constants'

export function CreateUserForm({ isPending }: { isPending: boolean }) {
  const { formState } = useFormContext()

  return (
    <FormGenerator
      fields={USER_FORM_FIELDS}
      actions={[
        {
          type: 'submit',
          label: USER_FORM_LABELS.SUBMIT_CREATE,
          disabled: !formState.isValid || isPending,
          loading: isPending,
        },
      ]}
    />
  )
}
```

---

## Mutation Error Handling (Delete, Update)

```typescript
// src/domains/user/hooks/use-delete-user.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUser } from '../api/delete-user'
import { getErrorMessage } from '@/shared/lib/api-error'
import { toast } from '@/shared/lib/toast'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', userId] })

      // Show success
      toast.success({ title: 'User deleted successfully' })
    },
    onError: (error) => {
      const message = getErrorMessage(error)

      // Show error toast
      toast.error({ title: `Failed to delete: ${message}` })

      // Log for debugging
      console.error('Delete user error:', { error, message })
    },
  })
}
```

---

## Query Error Handling (List, Detail)

```typescript
// src/domains/user/pages/UserListPage.tsx
import { useUsers } from '../hooks/use-users'
import { getErrorMessage } from '@/shared/lib/api-error'
import { Alert } from '@/shared/components/atoms/Alert'

export function UserListPage() {
  const { data, isLoading, isError, error } = useUsers()

  if (isError) {
    const message = getErrorMessage(error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to Load Users</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Alert>
    )
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* Render list */}
    </div>
  )
}
```

---

## Error Boundaries

### Global Error Boundary

```typescript
// src/shared/components/ErrorBoundary.tsx
import React, { ReactNode } from 'react'
import { captureException } from '@sentry/nextjs'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    // Log to console in dev
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-100 border border-red-400 rounded">
            <h2 className="font-bold text-red-800">Something went wrong</h2>
            <p className="text-red-700">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

### Route-Level Error Boundary

```typescript
// app/error.tsx (Next.js error boundary)
'use client'

import { useEffect } from 'react'
import { captureException } from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}
```

---

## Observability & Monitoring

### Sentry Setup

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Manual Error Reporting

```typescript
import { captureException, captureMessage } from '@sentry/nextjs'

// Capture exception with context
try {
  await riskyOperation()
} catch (error) {
  captureException(error, {
    tags: {
      operation: 'user_creation',
      userId: currentUserId,
    },
    contexts: {
      operation: {
        payload: { email, name },
      },
    },
  })
}

// Capture message (non-error)
captureMessage('User logged in', 'info', {
  tags: { userId: user.id },
})
```

---

## Structured Logging

### Logger Utility

```typescript
// src/shared/lib/logger.ts
export const logger = {
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, context)
    }
  },

  info: (message: string, context?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, context)
  },

  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, context)
  },

  error: (message: string, error?: Error, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, { error, ...context })

    // Report to Sentry
    if (error) {
      captureException(error, { contexts: { ...context } })
    }
  },
}
```

### Usage

```typescript
logger.info('User created', { userId: user.id, email: user.email })

logger.warn('API response slow', {
  endpoint: '/v1/users',
  duration: 5000, // ms
})

logger.error('Failed to fetch users', error, {
  retryAttempt: 3,
  backoffMs: 1000,
})
```

---

## Performance Monitoring (Web Vitals)

```typescript
// src/shared/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
import { captureMessage } from '@sentry/nextjs'

export function reportWebVitals() {
  // Cumulative Layout Shift
  getCLS((metric) => {
    if (metric.value > 0.1) {
      captureMessage(`CLS: ${metric.value}`, 'warning', {
        tags: { 'web-vital': 'cls' },
      })
    }
  })

  // First Input Delay
  getFID((metric) => {
    if (metric.value > 100) {
      captureMessage(`FID: ${metric.value}ms`, 'warning', {
        tags: { 'web-vital': 'fid' },
      })
    }
  })

  // Largest Contentful Paint
  getLCP((metric) => {
    if (metric.value > 2500) {
      captureMessage(`LCP: ${metric.value}ms`, 'warning', {
        tags: { 'web-vital': 'lcp' },
      })
    }
  })

  // Time to First Byte
  getTTFB((metric) => {
    console.log(`TTFB: ${metric.value}ms`)
  })
}
```

### Root Layout Setup

```typescript
// app/layout.tsx
import { reportWebVitals } from '@/shared/lib/web-vitals'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

---

## Error Code Reference

### Standard Error Codes

| Code | HTTP | Meaning | Retry? |
|---|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email/password | No |
| `UNAUTHORIZED` | 401 | Not authenticated | No |
| `FORBIDDEN` | 403 | Not authorized | No |
| `NOT_FOUND` | 404 | Resource doesn't exist | No |
| `VALIDATION_ERROR` | 422 | Invalid input | No |
| `CONFLICT` | 409 | Resource already exists | No |
| `RATE_LIMITED` | 429 | Too many requests | Yes (exponential backoff) |
| `SERVER_ERROR` | 500+ | Backend error | Yes (exponential backoff) |
| `NETWORK_ERROR` | - | No internet | Yes (exponential backoff) |

---

## Checklist

- [ ] API functions throw errors (no success flags)
- [ ] Error boundaries around routes/components
- [ ] Form errors use form.setError()
- [ ] Mutation errors show toast or inline message
- [ ] Query errors show alert/message
- [ ] Sentry configured for error tracking
- [ ] Web Vitals monitored
- [ ] Structured logging in place
- [ ] Error messages are user-friendly (Indonesian)
- [ ] Sensitive data never logged

---

## See Also

- [Testing Strategy](01-testing-strategy.md) — Test error scenarios
- [CLAUDE.md](../CLAUDE.md) — Architecture & conventions
