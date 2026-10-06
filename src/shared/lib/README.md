# Lib - Core Utilities and Configuration

Core library functions and configurations used across the application.

## Available Utilities

### axios.ts - HTTP Client

Configured Axios instance with authentication and error handling interceptors.

```typescript
import axios from "@/lib/axios";

// GET request
const { data } = await axios.get("/users");

// POST request with data
const response = await axios.post("/users", {
  name: "John",
  email: "john@example.com",
});

// With custom headers
const response = await axios.get("/protected", {
  headers: { Authorization: "Bearer token" },
});
```

**Features:**

- **Auto-attach auth token** — Reads from `useAuthStore().token` and adds to headers
- **Error handling** — Throws structured errors with ApiErrorClass
- **Error interceptor** — Catches 401 and refreshes token automatically
- **Base URL** — Configured from `NEXT_PUBLIC_API_URL`

**Configuration:**

```typescript
const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Request interceptor: adds auth token
apiInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handles errors
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Throws ApiErrorClass with structured error data
    throw new ApiErrorClass(error);
  }
);
```

---

### api-error.ts - Error Handling

Error extraction and handling utilities for API responses.

```typescript
import {
  getErrorMessage,
  getFieldErrors,
  getErrorCode,
  handleApiError,
} from "@/lib/api-error";

try {
  await axios.post("/users", userData);
} catch (error) {
  // Extract error message for display
  const message = getErrorMessage(error);
  console.error("Error:", message); // "Email already exists"

  // Extract field-specific validation errors
  const fieldErrors = getFieldErrors(error);
  form.setErrors(fieldErrors); // { email: "Already exists", name: "Required" }

  // Extract error code for handling
  const code = getErrorCode(error);
  if (code === "VALIDATION_ERROR") {
    // Handle validation error
  }

  // Or use combined handler
  const handledError = handleApiError(error);
  // Returns: { message, code, fieldErrors, statusCode }
}
```

**Available Functions:**

#### `getErrorMessage(error)`

Extracts user-friendly error message.

```typescript
const message = getErrorMessage(error);
// Returns: "Validation failed" or "Something went wrong"
```

#### `getFieldErrors(error)`

Extracts field-level validation errors.

```typescript
const fieldErrors = getFieldErrors(error);
// Returns: {
//   email: "Email already exists",
//   name: "Name is required",
//   password: "Password must be at least 8 characters"
// }

// Use with React Hook Form
form.setErrors(fieldErrors);
```

#### `getErrorCode(error)`

Extracts error code for specific handling.

```typescript
const code = getErrorCode(error);
// Returns: "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | etc.

switch (code) {
  case "VALIDATION_ERROR":
    // Handle validation
    break;
  case "UNAUTHORIZED":
    // Redirect to login
    break;
  case "FORBIDDEN":
    // Show access denied
    break;
}
```

#### `handleApiError(error)`

Combined error handler returning all extracted data.

```typescript
const { message, code, fieldErrors, statusCode } = handleApiError(error);
// Use for comprehensive error handling
```

#### `ApiErrorClass`

Custom error class for structured error data.

```typescript
try {
  throw new ApiErrorClass(axiosError);
} catch (error) {
  if (error instanceof ApiErrorClass) {
    console.log(error.message); // User-friendly message
    console.log(error.code); // Error code
    console.log(error.fieldErrors); // Field validation errors
    console.log(error.statusCode); // HTTP status code
  }
}
```

---

### api-response.ts - Response Types

Standard response type definitions for API responses.

```typescript
import {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
  createSuccessResponse,
  createPaginatedResponse,
} from "@/lib/api-response";

// Success response (single item)
interface UserResponse extends ApiSuccessResponse<User> {}

// Paginated response (list)
interface UsersListResponse extends ApiPaginatedResponse<User> {}

// Error response
interface ErrorResponse extends ApiErrorResponse {}
```

**Response Structures:**

#### `ApiSuccessResponse<T>`

```typescript
{
  success: true,
  data: { /* T */ },
  message: "Operation successful"
}
```

#### `ApiPaginatedResponse<T>`

```typescript
{
  success: true,
  data: [ /* T[] */ ],
  meta: {
    page: 1,
    perPage: 10,
    total: 100,
    totalPages: 10
  },
  links: {
    first: "/api/users?page=1",
    last: "/api/users?page=10",
    next: "/api/users?page=2"
  }
}
```

#### `ApiErrorResponse`

```typescript
{
  success: false,
  message: "Validation failed",
  errorCode: "VALIDATION_ERROR",
  errors: [
    {
      field: "email",
      message: "Email already exists",
      code: "UNIQUE_CONSTRAINT"
    }
  ]
}
```

---

### api-config.ts - API Configuration

API version and endpoint configuration.

```typescript
import { getApiPath } from "@/lib/api-config";

// Get API path with version
const endpoint = getApiPath("/users");
// Returns: /v1/users (if NEXT_PUBLIC_API_VERSION=v1)
```

**Configuration:**

- `NEXT_PUBLIC_API_VERSION` - API version (default: v1)
- Centralized endpoint management

---

### query-client.ts - React Query Configuration

React Query (TanStack Query) client configuration.

```typescript
import { queryClient } from "@/lib/query-client";

// Already configured in Providers component
// Features:
// - Default cache time: 5 minutes
// - Stale time: 1 minute
// - Retry on failure: 1 attempt
// - Network detection enabled
```

---

### query-params.ts - Query Parameter Utilities

Helper functions for URL query parameters.

```typescript
import {
  parseQueryParams,
  stringifyQueryParams,
  mergeQueryParams,
} from "@/lib/query-params";

// Parse query string to object
const params = parseQueryParams(
  "?page=1&search=john&sortBy=name&sortOrder=asc"
);
// Returns: { page: '1', search: 'john', sortBy: 'name', sortOrder: 'asc' }

// Convert object to query string
const queryString = stringifyQueryParams({ page: 1, search: "john" });
// Returns: 'page=1&search=john'

// Merge new params with existing
const merged = mergeQueryParams(
  { page: 1, search: "john" },
  { sortBy: "name" }
);
// Returns: { page: 1, search: 'john', sortBy: 'name' }
```

---

### utils.ts - General Utilities

Generic utility functions.

```typescript
import { cn } from "@/lib/utils";

// Merge Tailwind CSS classnames
const classes = cn(
  "px-4 py-2",
  "rounded-md",
  condition && "bg-primary",
  disabled && "opacity-50"
);
// Returns: 'px-4 py-2 rounded-md bg-primary opacity-50'
```

**Functions:**

- `cn(...classNames)` — Merge Tailwind classes with conditional support

---

## Common Patterns

### Pattern 1: API Call with Error Handling

```typescript
import axios from "@/lib/axios";
import { getErrorMessage, getFieldErrors } from "@/lib/api-error";

async function createUser(data: CreateUserPayload) {
  try {
    const response = await axios.post("/users", data);
    return response.data;
  } catch (error) {
    const fieldErrors = getFieldErrors(error);
    const message = getErrorMessage(error);

    if (fieldErrors) {
      form.setErrors(fieldErrors); // Set form errors
    } else {
      toast.error(message); // Show toast
    }
    throw error;
  }
}
```

### Pattern 2: React Query Hook with Error Handling

```typescript
import { useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { getErrorMessage } from "@/lib/api-error";

export function useCreateUser() {
  return useMutation({
    mutationFn: (data: CreateUserPayload) => axios.post("/users", data),
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
  });
}
```

### Pattern 3: Type-Safe API Response Handling

```typescript
import type { ApiSuccessResponse } from "@/lib/api-response";

interface User {
  id: string;
  name: string;
  email: string;
}

type GetUserResponse = ApiSuccessResponse<User>;

async function getUser(id: string): Promise<User> {
  const response = await axios.get<GetUserResponse>(`/users/${id}`);
  return response.data.data;
}
```

---

## Best Practices

1. **Always use axios** — Don't use fetch directly
2. **Always extract errors** — Use getErrorMessage, getFieldErrors
3. **Set form errors** — Use form.setErrors(getFieldErrors(error))
4. **Use type-safe responses** — Import response types from api-response
5. **Centralize API calls** — Put them in domain api/ files
6. **Let axios throw** — Don't wrap in try/catch at call site, let domain hooks handle it
7. **Use error codes** — Check errorCode for specific error handling
8. **Log errors** — Send to error tracking service (e.g., Sentry)

---

## Related Documentation

- [API Integration Pattern](../../DOCUMENTATION_INDEX.md) — Complete API layer guide
- [Error Handling](../../DOCUMENTATION_INDEX.md) — Error handling patterns
- [Domain APIs](../../domains/README.md) — How domains use these utilities
