# Schema Pattern — Zod Validation & Deduplication

How to write, organize, and deduplicate Zod schemas across domains.

---

## Philosophy

> **Start local, promote to global when reused.**

- A schema used by **only one domain** stays in that domain's `schemas/` folder.
- A schema (or field pattern) used by **2+ domains** gets promoted to `src/shared/schemas/`.
- Never copy-paste the same `z.string().min(1, '...')` block across domains.

---

## Directory Structure

```
src/
├── shared/schemas/
│   ├── is-active.ts          # Global isActive field schema
│   ├── email.ts              # Email validation schemas
│   ├── phone.ts              # Phone validation schemas
│   └── common.ts             # Common field & base schemas
│
src/domains/<domain>/
└── schemas/
    └── index.ts              # Domain-specific schemas (uses shared + local)
```

---

## Global Shared Schemas (`src/shared/schemas/`)

### Available Reusable Schemas

| Schema | Definition | Use For |
|---|---|---|
| `isActiveSchema` | `z.string({ message: 'Status wajib diisi' }).min(1, 'Status wajib diisi')` | All `type: 'select'` status fields |
| `codeRequiredSchema` | `z.string().min(1, 'Kode wajib diisi')` | Required code fields |
| `nameRequiredSchema` | `z.string().min(1, 'Nama wajib diisi')` | Required name fields |
| `descriptionOptionalSchema` | `z.string().optional()` | Optional description fields |
| `codeWithMaxSchema` | `z.string().min(1).max(50, '...')` | Code with 50-char limit |
| `nameWithMaxSchema` | `z.string().min(1).max(255, '...')` | Name with 255-char limit |
| `nullableIdSchema` | `z.string().nullable().optional()` | Nullable select IDs (province, city, etc.) |
| `optionalStringSchema` | `z.string().optional()` | Generic optional string |
| `optionalOrEmptyStringSchema` | `z.string().optional().or(z.literal(''))` | Edit-mode fields that clear to empty string |
| `booleanStringSchema` | `z.string()` | Toggle/select fields sending 'true'/'false' strings |
| `requiredSelectSchema(message)` | Factory: `z.string({ message }).min(1, message)` | Required dropdown fields |
| `addressBaseShape` | Object shape with `provinceId`, `cityId`, `districtId`, `villageId`, `addressDetail` | Create schemas with address fields |
| `addressEditBaseShape` | Same as above but `addressDetail` uses `optionalOrEmptyStringSchema` | Edit schemas with address fields |
| `simpleCreateSchema` | `code + name + description + isActive` (all required) | Simple CRUD create schemas |
| `simpleEditSchema` | Same as `simpleCreateSchema` | Simple CRUD edit schemas |
| `simpleWithMaxCreateSchema` | Same as `simpleCreateSchema` but with `.max()` on code/name | Simple CRUD with max length |
| `simpleWithMaxEditSchema` | Same as `simpleWithMaxCreateSchema` | Simple CRUD edit with max length |

### Import Pattern

```typescript
import {
  codeRequiredSchema,
  descriptionOptionalSchema,
  isActiveSchema,
  nameRequiredSchema,
  requiredSelectSchema,
  addressBaseShape,
  addressEditBaseShape,
  simpleCreateSchema,
  simpleEditSchema,
} from '@/shared/schemas/common';
```

---

## Domain Schema Patterns

### Pattern 1: Simple CRUD (Identical Create/Edit)

Use this when your form has **code, name, description, isActive** with no extra fields.

**Domains using this:** project-type, cost-item-type, payment-type, project-capability, job-item-type

```typescript
// src/domains/project-type/schemas/index.ts
export {
  simpleCreateSchema as createProjectTypeSchema,
  simpleEditSchema as editProjectTypeSchema,
} from '@/shared/schemas/common';
```

> **Why:** These 5 domains have identical schema structures. Using re-exports eliminates 60+ lines of duplicated code.

---

### Pattern 2: Simple CRUD + Extra Fields

Use the shared field schemas and compose with `z.object()`.

```typescript
// src/domains/uom/schemas/index.ts
import { z } from 'zod';
import {
  codeRequiredSchema,
  descriptionOptionalSchema,
  isActiveSchema,
  nameRequiredSchema,
} from '@/shared/schemas/common';

export const createUomSchema = z.object({
  code: codeRequiredSchema,
  group: z.string().min(1, 'Kelompok wajib diisi'),  // domain-specific
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const editUomSchema = createUomSchema;  // identical in this case
```

---

### Pattern 3: Entity with Address Fields

Use `addressBaseShape` / `addressEditBaseShape` via object spread.

```typescript
// src/domains/company/schemas/index.ts
import { z } from 'zod';
import {
  addressBaseShape,
  addressEditBaseShape,
  codeRequiredSchema,
  isActiveSchema,
  nameRequiredSchema,
  optionalOrEmptyStringSchema,
  optionalStringSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';
import { optionalEmailSchema } from '@/shared/schemas/email';
import { optionalPhoneNumberSchema } from '@/shared/schemas/phone';

export const createCompanySchema = z.object({
  groupId: requiredSelectSchema('Group wajib dipilih'),
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  npwp: optionalStringSchema,
  siupNumber: optionalStringSchema,
  projectCapabilityIds: z.array(z.string()).min(1, 'Project Capabilities wajib dipilih'),
  phone: optionalPhoneNumberSchema.optional(),
  email: optionalEmailSchema,
  isActive: isActiveSchema,
  ...addressBaseShape,  // ← spreads provinceId, cityId, districtId, villageId, addressDetail
});

export const editCompanySchema = z.object({
  groupId: z.string().min(1, 'Group wajib dipilih').optional(),
  code: codeRequiredSchema.optional(),
  name: nameRequiredSchema.optional(),
  npwp: optionalOrEmptyStringSchema,
  siupNumber: optionalOrEmptyStringSchema,
  projectCapabilityIds: z.array(z.string()).optional(),
  phone: optionalPhoneNumberSchema.optional().or(z.literal('')),
  email: optionalEmailSchema,
  isActive: isActiveSchema,
  ...addressEditBaseShape,  // ← same but addressDetail clears to ''
});
```

---

### Pattern 4: Edit Schema with Optional Fields

When create requires a field but edit makes it optional, use `.optional()` on the shared schema:

```typescript
// In edit schema
code: codeRequiredSchema.optional(),      // was required in create
name: nameRequiredSchema.optional(),      // was required in create
```

> **Exception:** For fields that clear to empty string in edit mode (like `addressDetail`), use `optionalOrEmptyStringSchema` instead of `optionalStringSchema`.

---

## Migration Rule: When to Promote to Shared

| Situation | Action |
|---|---|
| Field pattern used in **1 domain** | Keep in domain `schemas/index.ts` |
| Field pattern used in **2+ domains** | Promote to `src/shared/schemas/common.ts` |
| Entire schema identical across **2+ domains** | Create a named base schema in `common.ts` and re-export from domains |
| Domain-specific message (e.g., 'Nama role wajib diisi') | Keep inline or create a parameterized factory |

### How to Promote

1. **Identify the duplicate** — grep for the pattern across all `src/domains/*/schemas/`
2. **Create in `src/shared/schemas/common.ts`** — add the schema or factory function
3. **Update imports** — replace inline definitions with imports from `@/shared/schemas/common`
4. **Run `pnpm run type-check`** — verify no regressions
5. **Update this doc** — add the new schema to the "Available Reusable Schemas" table

---

## Anti-Patterns (Never Do)

### ❌ Copy-Paste Field Definitions

```typescript
// BAD — same block in 10+ files
code: z.string().min(1, 'Kode wajib diisi'),
name: z.string().min(1, 'Nama wajib diisi'),
```

### ❌ Inline `z.object()` in Form Components

```typescript
// BAD — schema belongs in schemas/, not inline
<FormGenerator schema={z.object({ ... })} />
```

### ❌ Different Messages for the Same Validation

```typescript
// BAD — inconsistent error messages
code: z.string().min(1, 'Kode wajib diisi'),     // domain A
code: z.string().min(1, 'Code is required'),      // domain B
code: z.string().min(1, 'Kode harus diisi'),       // domain C
```

### ✅ Use Shared Schemas

```typescript
// GOOD — single source of truth
code: codeRequiredSchema,   // 'Kode wajib diisi' everywhere
```

---

## Type Exports

Always export inferred types alongside schemas:

```typescript
export type CreateProjectTypeInput = z.infer<typeof createProjectTypeSchema>;
export type EditProjectTypeInput = z.infer<typeof editProjectTypeSchema>;
```

> **Tip:** If a domain only re-exports from `common.ts`, it does not need type exports unless the consuming code references them.

---

## Validation Checklist

Before committing schema changes:

- [ ] No duplicated `z.string().min(1, '...')` blocks across domains
- [ ] `isActive` fields use `isActiveSchema` from `@/shared/schemas/common`
- [ ] Address fields use `addressBaseShape` / `addressEditBaseShape` where applicable
- [ ] Simple CRUD schemas (code + name + description + isActive) use `simpleCreateSchema` / `simpleEditSchema`
- [ ] `pnpm run type-check` passes with zero errors
- [ ] Form field names match schema property names exactly
- [ ] `edit*` schemas use `.optional()` only where the UI actually allows empty values
