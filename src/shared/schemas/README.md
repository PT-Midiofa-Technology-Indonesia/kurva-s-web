# Schemas - Reusable Zod Validation

Cross-domain Zod validation schemas.

## Available Schemas

### common.ts

Common field schemas used across domains:

```typescript
import {
  codeRequiredSchema,
  nameRequiredSchema,
  descriptionOptionalSchema,
  codeWithMaxSchema,
  nameWithMaxSchema,
  simpleCreateSchema,
  simpleEditSchema,
  simpleWithMaxCreateSchema,
  simpleWithMaxEditSchema,
  nullableIdSchema,
  optionalStringSchema,
  addressBaseShape,
} from '@/shared/schemas/common';
```

**Field Schemas:**
- `codeRequiredSchema` — Required code field
- `nameRequiredSchema` — Required name field
- `descriptionOptionalSchema` — Optional description
- `codeWithMaxSchema` — Code with max 50 chars
- `nameWithMaxSchema` — Name with max 255 chars

**CRUD Schemas:**
- `simpleCreateSchema` — { code, name, description, isActive }
- `simpleEditSchema` — Same fields for editing
- `simpleWithMaxCreateSchema` — With max length validation
- `simpleWithMaxEditSchema` — With max length validation

**Address Shapes:**
- `addressBaseShape` — { provinceId, cityId, districtId, villageId, addressDetail }
- `addressEditBaseShape` — Same with optional/empty string support

---

### is-active.ts

Active status schema for toggles.

```typescript
import { isActiveSchema } from '@/shared/schemas/is-active';

// Validates: 'active' | 'inactive'
```

---

### email.ts

Email validation schema.

```typescript
import { emailSchema } from '@/shared/schemas/email';
```

---

### phone.ts

Phone number validation schema (Indonesian format).

```typescript
import { phoneSchema } from '@/shared/schemas/phone';
```

---

## Usage in Domains

```typescript
import { simpleCreateSchema } from '@/shared/schemas/common';

export const PROJECT_TYPE_SCHEMA = simpleCreateSchema;

export function useCreateProjectType() {
  return useMutation({
    mutationFn: (data) => createProjectType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
    },
  });
}
```

---

## Adding New Schemas

Add cross-domain schemas here when used by 2+ domains.

For domain-specific schemas, use `@/domains/<domain>/schemas/` instead.