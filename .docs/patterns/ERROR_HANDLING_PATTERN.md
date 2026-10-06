# Error Handling Pattern — Complete Reference

Errors thrown from the API layer are caught by React Query, typed as AxiosError, and handled consistently across the app.

---

## Quick Rules

- **API layer throws errors** — Never return error objects
- **Never ignore errors** — Always handle them explicitly
- **Type error in catch blocks** — Use `AxiosError<ApiErrorResponse>`
- **Use error extractors** — Get message, code, and validation errors
- **Display to user** — Show message in toast or form.setError()
- **Log in dev/production** — Context matters for debugging

---

## API Error Response Structure

All error responses follow this envelope:

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

---

## Step 1: Type Errors in Catch Blocks

```typescript
// src/domains/<domain>/api/login.ts
import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export async function login(credentials: LoginRequest): Promise<User> {
  try {
    const { data } = await api.post<ApiSuccessResponse<User>>('/v1/auth/login', credentials);
    return data.data;
  } catch (error) {
    // Type the error properly
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse;
      throw new Error(apiError?.message || 'Login failed');
    }
    throw new Error('Login failed');
  }
}
```

---

## Step 2: Extract Error Information

Use error helper functions from `@/shared/lib/api-error`:

```typescript
// src/shared/lib/api-error.ts (already exists)
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export class ApiErrorClass extends Error {
  code: string;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, code: string = 'UNKNOWN', fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiErrorClass) {
    return error.message;
  }
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message || error.message || 'Something went wrong';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}

export function getErrorCode(error: unknown): string {
  if (error instanceof ApiErrorClass) {
    return error.code;
  }
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.errorCode || 'UNKNOWN';
  }
  return 'UNKNOWN';
}

export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (error instanceof ApiErrorClass) {
    return error.fieldErrors;
  }
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.errors || {};
  }
  return {};
}
```

---

## Step 3: Handle in Components

### For Forms (Recommended Pattern)

When using `FormGenerator`, pass backend errors via the `externalErrors` prop. The component handles setting and clearing field-level errors automatically.

```typescript
// Page hook: extract and expose field errors
import { getFieldErrors } from '@/lib/api-error';

export function useCreateRolePage() {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const { mutate: createRoleMutate, isPending } = useCreateRole();

  const handleBeforeSubmit = (payload: CreateRolePayload) => {
    setServerErrors({}); // Clear previous errors on new submission
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createRoleMutate(pendingPayload, {
      onSuccess: () => { /* ... */ },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setServerErrors(fieldErrors);
        }
      },
    });
  };

  return { serverErrors, handleBeforeSubmit, handleConfirmSubmit, /* ... */ };
}
```

```tsx
// Page component: pass errors down to form
<RoleForm
  onSubmit={handleBeforeSubmit}
  onCancel={handleCancel}
  isSubmitting={isPending}
  serverErrors={serverErrors}
/>
```

```tsx
// Form component: forward to FormGenerator
interface RoleFormProps {
  serverErrors?: Record<string, string[]>;
  /* ... */
}

export function RoleForm({ serverErrors, /* ... */ }: RoleFormProps) {
  return (
    <FormCard>
      <FormGenerator
        id="role-form"
        fields={ROLE_FORM_FIELDS}
        schema={roleFormSchema}
        onSubmit={handleFormSubmit}
        externalErrors={serverErrors}
        actions={<RoleFormActions />}
      />
    </FormCard>
  );
}
```

**When the API returns:**
```json
{
  "success": false,
  "message": "Data yang diberikan tidak valid.",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "latitude": ["Latitude harus berupa angka."]
  }
}
```

**Result:** The message "Latitude harus berupa angka." appears under the `latitude` field automatically.

### Manual Form Handling (Without FormGenerator)

If not using `FormGenerator`, manually set field errors via `form.setError()`:

```typescript
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';

export function LoginForm() {
  const form = useForm<LoginInput>();
  
  const { mutate: submit, isPending } = useMutation({
    mutationFn: login,
    onError: (error) => {
      const message = getErrorMessage(error);
      const fieldErrors = getFieldErrors(error);

      // Display general error
      form.setError('root', { message });

      // Display field-specific errors
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        form.setError(field as any, { message: messages[0] });
      });
    },
  });

  return (
    <form onSubmit={form.handleSubmit(submit)}>
      {/* Form fields here */}
      {form.formState.errors.root && (
        <Alert variant="destructive">{form.formState.errors.root.message}</Alert>
      )}
    </form>
  );
}
```

### For Lists / Data Fetching

```typescript
// src/domains/<domain>/pages/ResourceListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { getResources } from '../api/get-resources';

export function ResourceListPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['resources'],
    queryFn: () => getResources(),
  });

  if (isError) {
    const message = getErrorMessage(error);
    return (
      <Alert variant="destructive">
        Failed to load resources: {message}
      </Alert>
    );
  }

  return (
    // Render list
  );
}
```

### For Mutations (Delete, Update, Create)

```typescript
// Delete handler
const { mutate: deleteResource, isPending } = useMutation({
  mutationFn: deleteItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
    toast.success({ title: 'Resource deleted successfully' });
  },
  onError: (error) => {
    const message = getErrorMessage(error);
    toast.error({ title: `Failed to delete: ${message}` });
  },
});
```

---

## Validation Error Example

When the API returns validation errors, extract and display them in forms:

### With FormGenerator (Recommended)

```typescript
// Hook
const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

onError: (error) => {
  const fieldErrors = getFieldErrors(error);
  if (fieldErrors) {
    setServerErrors(fieldErrors);
  }
}

// Component
<FormGenerator
  fields={fields}
  schema={schema}
  onSubmit={onSubmit}
  externalErrors={serverErrors}  // FormGenerator handles the rest
/>
```

### Without FormGenerator (Manual)

```typescript
// API response with validation errors
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "email": ["Email is required", "Must be valid email"],
    "password": ["Minimum 6 characters"]
  }
}

// In form handler
onError: (error) => {
  const fieldErrors = getFieldErrors(error);
  
  // Set all errors in form
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    form.setError(field as any, { 
      message: messages.join(', ') // Join multiple messages
    });
  });
}
```

---

## HTTP Status Code Handling

React Query/Axios automatically treats status codes properly:

| Code | Behavior | Handling |
|---|---|---|
| 200-299 | Success | Resolved in `.onSuccess()` |
| 400 | Bad request (validation) | Rejected in `.onError()` |
| 401 | Unauthorized | Rejected in `.onError()` + redirect to login |
| 403 | Forbidden | Rejected in `.onError()` |
| 404 | Not found | Rejected in `.onError()` |
| 500+ | Server error | Rejected in `.onError()` |

**Don't check for `!success` in responses** — Axios throws on error status codes.

---

## Error Flow Diagram

```
API Function
    ↓
[Try API Call]
    ↓
Success? → Return data → Hook success handler
    ↓
Error? → Throw Error or ApiErrorClass
    ↓
React Query catches → Passes to onError handler
    ↓
Component extracts message/code/fieldErrors
    ↓
Display to user (toast, form.setError(), alert)
```

---

## Best Practices Checklist

- [ ] API layer throws errors (never returns error objects)
- [ ] Errors typed in catch blocks as `AxiosError<ApiErrorResponse>`
- [ ] Error extractors used (getErrorMessage, getErrorCode, getFieldErrors)
- [ ] **When using FormGenerator: pass field errors via `externalErrors` prop**
- [ ] **Always clear `serverErrors` before new form submission**
- [ ] Form validation errors set via form.setError() (manual forms only)
- [ ] List errors displayed in UI (alert, message)
- [ ] Mutation errors shown in toast or inline
- [ ] User-facing messages from API (not error codes)
- [ ] Field-specific errors mapped to form fields
- [ ] No silent error handling (console.log only)
- [ ] Error context logged for debugging

---

## Error Handling by Context

### Form Submission (with FormGenerator)
```typescript
// Hook
const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

const handleBeforeSubmit = (payload: Payload) => {
  setServerErrors({}); // Always clear previous errors before submit
  setPendingPayload(payload);
  setIsDialogOpen(true);
};

const handleConfirmSubmit = () => {
  mutate(pendingPayload, {
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        setServerErrors(fieldErrors);
      }
    },
  });
};

// Form component
<FormGenerator
  fields={fields}
  schema={schema}
  onSubmit={onSubmit}
  externalErrors={serverErrors}
/>
```

### Form Submission (manual form.setError)
```typescript
onError: (error) => {
  const message = getErrorMessage(error);
  const fieldErrors = getFieldErrors(error);
  
  form.setError('root', { message });
  Object.entries(fieldErrors).forEach(([field, msgs]) => {
    form.setError(field, { message: msgs[0] });
  });
}
```

### Data List / Query
```typescript
if (isError) {
  const message = getErrorMessage(error);
  return <Alert variant="destructive">{message}</Alert>;
}
```

### Delete / Mutation
```typescript
onError: (error) => {
  const message = getErrorMessage(error);
  toast.error({ title: `Failed: ${message}` });
}
```

---

## Avoid These Patterns

❌ **Ignore errors**:
```ts
const { mutate: deleteItem } = useMutation({
  mutationFn: delete,
  // Missing onError handler
});
```

❌ **Log errors to console in production**:
```ts
catch (error) {
  console.log(error);  // Use proper logging
}
```

❌ **Return error objects from API**:
```ts
return { success: false, error: new Error(...) };
```

❌ **Silent failures**:
```ts
catch (error) {
  // Don't swallow — always handle
}
```

---

## See Also

- [[API_PATTERN.md]] — API functions that throw errors
- [[FORMS_PATTERN.md]] — Form validation and error display
