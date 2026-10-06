# Forms Pattern — Complete Reference

All forms follow a consistent pattern using React Hook Form, Zod validation, and FormGenerator component.

---

## Quick Rules

- **Always use FormGenerator** — Never build manual form inputs
- **Wrap every form in `<FormCard>`** — Import from `@/components/molecules`; never inline the card styles
- **Define fields in constants** — `src/domains/<domain>/constants/form-fields.ts`
- **Validation with Zod** — schemas live in `src/domains/<domain>/schemas/index.ts`, exported as `create<Entity>Schema` / `edit<Entity>Schema`
- **Never hardcode UI strings** — All labels, placeholders, options in constants
- **Disable submit when invalid** — Use `formState.isValid` from form context
- **Use useFormContext()** — Components read form state via context, not props
- **Validate at both layers** — Component validation + API validation
- **Always pass backend errors to FormGenerator** — Use `externalErrors` prop for field-level server errors
- **⚠️ Cancel/back/reset buttons inside a form MUST have `type="button"`** — A `<button>` without an explicit `type` defaults to `type="submit"` and triggers Zod validation + form submission on click. See [[#button-type-required-for-non-submit-buttons]]

---

## Directory Structure

```
src/domains/<domain>/
├── constants/
│   └── form-fields.ts        # Field definitions & UI strings
├── schemas/
│   └── <entity>.schema.ts    # Zod validation schemas
├── components/
│   └── <Entity>Form.tsx      # Form component using FormGenerator
└── hooks/
    └── use-<entity>-form.ts  # Form submission logic
```

---

## Step 1: Define Form Fields (constants)

```typescript
// src/domains/<domain>/constants/form-fields.ts
import type { FormField } from '@/types/form';

export const ROLE_FORM_FIELDS: FormField[] = [
  {
    name: 'name',
    label: 'Role Name',
    type: 'text',
    placeholder: 'e.g., Administrator',
    required: true,
    validation: 'min:1,max:255',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe what this role does...',
    required: false,
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'permissions',
    label: 'Permissions',
    type: 'multi-select',
    options: [
      { label: 'Read', value: 'read' },
      { label: 'Write', value: 'write' },
      { label: 'Delete', value: 'delete' },
    ],
    required: true,
  },
];

export const ROLE_FORM_LABELS = {
  CREATE_TITLE: 'Create Role',
  EDIT_TITLE: 'Edit Role',
  SUBMIT_CREATE: 'Create Role',
  SUBMIT_EDIT: 'Save Changes',
  DELETE_CONFIRM: 'Are you sure you want to delete this role?',
  SUCCESS_CREATE: 'Role created successfully',
  SUCCESS_UPDATE: 'Role updated successfully',
  SUCCESS_DELETE: 'Role deleted successfully',
};
```

---

## Step 2: Define Zod Schemas

> **Before writing a new schema, check [[SCHEMA_PATTERN.md]]** — reuse `codeRequiredSchema`, `nameRequiredSchema`, `isActiveSchema`, `simpleCreateSchema`, `addressBaseShape`, and other shared schemas to avoid duplication.

```typescript
// src/domains/<domain>/schemas/role.schema.ts
import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Max 255 characters'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).min(1, 'At least one permission required'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema.partial().extend({
  id: z.string(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
```

### Reusing Shared Schemas

When your form follows common patterns (code + name + description + isActive), import from `@/shared/schemas/common` instead of inlining:

```typescript
// For simple CRUD entities (project-type, cost-item-type, payment-type, etc.)
export {
  simpleCreateSchema as createProjectTypeSchema,
  simpleEditSchema as editProjectTypeSchema,
} from '@/shared/schemas/common';
```

See [[SCHEMA_PATTERN.md]] for the full catalog of reusable schemas and migration rules.

---

## Step 3: Create Form Component

Wrap every form with `<FormCard>` — it provides the standard white card container (`bg-white border border-slate-200 rounded-[14px] shadow-sm` with `px-6 py-6` padding). Never inline these styles.

```typescript
// src/domains/<domain>/components/RoleForm.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { createRoleSchema, editRoleSchema } from '../schemas';
import type { CreateRoleInput } from '../schemas';

interface RoleFormProps {
  mode?: 'create' | 'edit';
  isSubmitting?: boolean;
  onCancel?: () => void;
  /** Backend validation errors mapped to form fields */
  serverErrors?: Record<string, string[]>;
}

function RoleFormActions({ mode, isSubmitting, onCancel }: RoleFormProps) {
  const { formState } = useFormContext<CreateRoleInput>();
  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Batal</Button>
      <Button type="submit" form="role-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Simpan'}
      </Button>
    </div>
  );
}

export function RoleForm({ mode = 'create', isSubmitting, onCancel, serverErrors }: RoleFormProps) {
  return (
    <FormCard>
      <FormGenerator
        id="role-form"
        fields={ROLE_FORM_FIELDS}
        schema={(mode === 'edit' ? editRoleSchema : createRoleSchema) as any}
        actions={<RoleFormActions mode={mode} isSubmitting={isSubmitting} onCancel={onCancel} />}
        externalErrors={serverErrors}
      />
    </FormCard>
  );
}
```

---

## Step 4: Create Form Submission Hook

```typescript
// src/domains/<domain>/hooks/use-create-role-page.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import { createRole, type CreateRolePayload } from '../api/create-role';
import { useCreateRole } from './use-create-role';

export function useCreateRolePage() {
  const router = useRouter();
  const { mutate: createRoleMutate, isPending } = useCreateRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateRolePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/user-management/role-permission');

  const handleBeforeSubmit = (payload: CreateRolePayload) => {
    setServerErrors({}); // Clear previous backend errors on new submit
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createRoleMutate(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/user-management/role-permission');
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setServerErrors(fieldErrors);
        }
      },
    });
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
```

---

## Step 5: Use in Page

```typescript
// src/domains/<domain>/pages/CreateRolePage.tsx
'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { RoleForm } from '../components/RoleForm';
import { ROLE_LABELS } from '../constants';
import { useCreateRolePage } from '../hooks/use-create-role-page';

export function CreateRolePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateRolePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={ROLE_LABELS.CREATE.PAGE_TITLE}
        onBack={handleCancel}
      />

      <RoleForm
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ROLE_LABELS.CREATE.DIALOG.TITLE}
        description={ROLE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={ROLE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={ROLE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
```

### Edit Page — Loading State

Edit pages must fetch existing data before rendering the form. Use `FormPageSkeleton` while loading:

```typescript
// src/domains/<domain>/pages/EditRolePage.tsx
'use client';

import { FormPageSkeleton } from '@/components/templates';

export function EditRolePage({ roleId }: { roleId: string }) {
  const { role, isLoading, ... } = useEditRolePage(roleId);

  if (isLoading) return <FormPageSkeleton />;          // default 4 fields
  // if (isLoading) return <FormPageSkeleton fields={6} />; // for 6-field forms

  if (!role) return <p>Not found</p>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />
      <RoleForm mode="edit" role={role} onSubmit={handleBeforeSubmit} ... />
      <ConfirmDialog ... />
    </div>
  );
}
```

`FormPageSkeleton` renders a page header skeleton + FormCard shell with a 2-column field grid + action buttons row. No visible text — tests must not assert on "Loading..." text.

---

## FormGenerator Component

The `FormGenerator` component (in `@/shared/components/organisms/FormGenerator`) handles all rendering. Props:

```typescript
interface FormGeneratorProps<T> {
  id?: string;                   // Form element id (for actions)
  fields: FormFieldConfig<T>[];  // Array of field configs
  schema: ZodType<T>;            // Zod validation schema
  onSubmit: SubmitHandler<T>;    // Submit handler
  defaultValues?: DefaultValues<T>;
  className?: string;
  actions?: ReactNode;           // Custom action buttons
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  /** Backend validation errors to display under form fields */
  externalErrors?: Record<string, string[]>;
}
```

### Skip Data Fetching for Fields With Disable/Hide Rules

**Rule:** When a field has `enableRules` (disabled by default) or `hideRules` (hidden by default), the data hook that powers its options **must not fire on first load**. Pass an `enabled` flag tied to the dependency so the fetch only runs once the user can actually interact with the field.

**Why:**
- Avoids unnecessary network requests on page load
- Prevents flicker (loading → empty list → populated list) for fields the user can't see or interact with
- Cuts down backend load on list pages with many dependent dropdowns (e.g. province → city → district → village cascades)

**Pattern:**

```typescript
// ❌ BAD — fetches ALL categories on first load, even though the field is disabled
const { data: itemCategories } = useItemCategories({
  itemTypeId: selectedItemTypeId || undefined,
});

// ✅ GOOD — only fetches when the user has selected an item type
const { data: itemCategories } = useItemCategories(
  { itemTypeId: selectedItemTypeId || undefined },
  { enabled: !!selectedItemTypeId }
);
```

**Hook contract:** data hooks used for dependent fields should accept a second `options` parameter (matching React Query's `enabled` field) so the form can pass `{ enabled: !!dependency }`. See `useItemCategories` in `src/domains/item-master/hooks/use-item-categories.ts` for the reference implementation.

**Pair with `enableRules` on the field config:**

```typescript
{
  name: 'itemCategoryId',
  type: 'select',
  options: itemCategoryOptions,
  isLoading: isItemCategoriesLoading,
  enableRules: [{ conditions: [{ field: 'itemTypeId', evaluator: (val) => !!val }] }],
}
```

This combination guarantees: no fetch → field disabled → user picks parent → fetch fires → field enables with options loaded.

**Applies to:** all dependent select/cascading fields (item type → item category, province → city → district → village, parent skill → child skill, etc.).

---

## Infinite Scroll for API-fed Select Fields

When a select field loads its options from an API endpoint, **never use `perPage: 100`** to fetch all options at once. Use `useInfiniteQuery` so the dropdown loads more as the user scrolls, and supports server-side search.

### When to use this pattern

Apply whenever a `type: 'select'` field sources options from an API (e.g. item types, categories, skill catalogs, companies, departments). Skip for static option arrays or enums.

### 1. Create the infinite hook

One hook per entity. Place it in `src/domains/<domain>/hooks/use-<entity>-infinite.ts`.

```typescript
// src/domains/item-master/hooks/use-item-types-infinite.ts
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getItemTypes } from '../api/get-item-types';

export interface UseItemTypesInfiniteOptions {
  perPage?: number;   // default: 10
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useItemTypesInfinite(options?: UseItemTypesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['item-types-infinite', perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getItemTypes({ page: pageParam, perPage, search: search || undefined }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const selectOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((t) => ({ value: t.id, label: t.name }))
    );
  }, [data?.pages]);

  return {
    options: selectOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
```

**Return shape contract** — always return these fields:

| Field | Type | Purpose |
|---|---|---|
| `options` | `SelectOption[]` | Accumulated options across all loaded pages |
| `isLoading` | `boolean` | True on first page load |
| `hasMore` | `boolean` | True when more pages exist |
| `isFetchingNextPage` | `boolean` | True while loading page 2+ |
| `loadMore` | `() => void` | Triggers next page fetch |
| `error` | `Error \| null` | Propagates query errors |

Export the hook and its options type from `src/domains/<domain>/index.ts`.

### 2. Wire into a form component

```typescript
// In your form component
import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useItemTypesInfinite } from '../hooks/use-item-types-infinite';

export function ItemCategoryForm(/* ... */) {
  // ① Search state + debounce (300ms prevents API spam on keystrokes)
  const [itemTypeSearch, setItemTypeSearch] = useState('');
  const debouncedItemTypeSearch = useDebounce(itemTypeSearch, 300);

  // ② Infinite hook — pass the debounced value as search
  const {
    options: itemTypeOptions,
    isLoading: isLoadingItemTypes,
    hasMore: hasMoreItemTypes,
    isFetchingNextPage: isFetchingMoreItemTypes,
    loadMore: loadMoreItemTypes,
  } = useItemTypesInfinite({ search: debouncedItemTypeSearch });

  // ③ Stable callbacks — useCallback prevents useMemo dep churn
  const handleItemTypeSearchChange = useCallback(
    (v: string) => setItemTypeSearch(v),
    []
  );
  const handleItemTypeScrollToBottom = useCallback(() => {
    if (hasMoreItemTypes && !isFetchingMoreItemTypes) loadMoreItemTypes();
  }, [hasMoreItemTypes, isFetchingMoreItemTypes, loadMoreItemTypes]);

  // ④ Wire into the field config — include all 4 handler refs in useMemo deps
  const fields = useMemo<FormFieldConfig<MyFormInput>[]>(
    () => [
      {
        name: 'itemTypeId',
        type: 'select',
        label: '...',
        isSearchable: true,
        options: itemTypeOptions,
        isLoading: isLoadingItemTypes,
        onScrollToBottom: handleItemTypeScrollToBottom,  // load more on scroll
        onSearchChange: handleItemTypeSearchChange,      // server-side search
      },
    ],
    [itemTypeOptions, isLoadingItemTypes, handleItemTypeScrollToBottom, handleItemTypeSearchChange]
  );
}
```

### 3. Lazy-load for drawers and conditional fields

Pass `enabled: open` when the field is inside a drawer or hidden by default, so no fetch fires until the UI is visible:

```typescript
const { options } = useItemTypesInfinite({
  search: debouncedSearch,
  isActive: true,
  enabled: open,  // no fetch until the drawer opens
});
```

### 4. Integration test mocks

Infinite hooks default to `perPage: 10`. Update MSW mock metadata to match:

```typescript
// ✅ CORRECT
meta: { currentPage: 1, perPage: 10, total: 2, lastPage: 1, from: 1, to: 2 }

// ❌ OLD — perPage: 100 no longer matches the hook default
meta: { currentPage: 1, perPage: 100, total: 2, lastPage: 1, from: 1, to: 2 }
```

Set `lastPage: 1` in tests to prevent the hook from attempting a second page fetch.

### 5. Cell-editor limitation

The DataTable `meta.selectOptions` is a plain static array. Inline cell editors do **not** support `onScrollToBottom` or `onSearchChange`. Use the accumulated `options` from the infinite hook directly — the cell editor shows whatever has been loaded so far. Do not attempt to add scroll-to-load to the cell editor without changes to `DataTable`.

---

## Input Masks

The `mask` prop on text/email/password fields receives the raw input value and returns a sanitized version. The mask runs on every keystroke via `onChange` (`src/shared/components/organisms/FormGenerator/FormFieldRenderer.tsx:255`), so the value the user sees is always the masked value.

Available masks live in `src/shared/utils/masks.ts`:

| Mask | Purpose | Example |
|---|---|---|
| `maskPhone` | Strips non-digits, caps length, removes leading `0` | `"0812abc34"` → `"81234"` |
| `maskNpwp` | Formats to `##.###.###.#-###.###` | `"123456789012345"` → `"12.345.678.9-012.345"` |
| `maskDigits(value, max)` | Digits-only, capped length | generic numeric input |
| `noWhitespace` | Strips ALL whitespace | `"  user @x.com "` → `"user@x.com"` |
| `stripPhonePrefix(value)` | Strips `62` / `+62` / `08` prefix (utility, not a mask) | `"62812..."` → `"812..."` |

### Mandatory Masks (Don't Forget)

⚠️ **The following masks are MANDATORY — omitting them has caused production bugs (whitespace sneaking into emails, leading `62` showing up twice in edit mode, malformed phone numbers on submit).**

#### 1. Email fields → `mask: noWhitespace`

**Every email field** must use `noWhitespace`. Emails cannot legally contain spaces, and copy-paste from spreadsheets/chat apps often introduces invisible whitespace.

```typescript
// ✅ CORRECT
{
  name: 'email',
  type: 'text',          // or 'email'
  label: 'Email',
  required: true,
  mask: noWhitespace,    // ← MANDATORY
}

// ❌ BAD — leading/trailing spaces pass through, server rejects with cryptic error
{
  name: 'email',
  type: 'text',
  label: 'Email',
  required: true,
}
```

**Applies to:** every `name: 'email'` field, regardless of `type` (`'text'`, `'email'`, etc.). Including login forms, signup forms, profile forms.

#### 2. Password fields → `mask: noWhitespace`

**Every password field** must use `noWhitespace`. Passwords with spaces almost always indicate user error (auto-complete inserting a space, accidental double-tap on spacebar) and cause confusing login failures.

```typescript
// ✅ CORRECT
{
  name: 'password',
  type: 'password',
  label: 'Password',
  required: true,
  mask: noWhitespace,    // ← MANDATORY
}

// ❌ BAD — space character ends up in hashed password, user can't log in
{
  name: 'password',
  type: 'password',
  label: 'Password',
  required: true,
}
```

**Applies to:** every `name: 'password'` field — login, signup, change-password, reset-password, user-create forms.

#### 3. Code fields → `mask: noWhitespace`

**Every `name: 'code'` field** must use `noWhitespace`. Codes are stored verbatim and used as unique identifiers — they are almost always looked up by exact match, and leading/trailing spaces silently break the lookup. Copy-paste from spreadsheets is the most common source of stray whitespace.

```typescript
// ✅ CORRECT
{
  name: 'code',
  type: 'text',
  label: 'Code',
  required: true,
  mask: noWhitespace,    // ← MANDATORY
}

// ❌ BAD — "COMPANY-001 " (trailing space) saves successfully but won't match lookups
{
  name: 'code',
  type: 'text',
  label: 'Code',
  required: true,
}
```

**Applies to:** every `name: 'code'` field, regardless of domain (company, office, warehouse, UoM, skill category/catalog, payment type, project type/capability, hierarchy, cost item type, job item type, vendor catalog, item catalog/category, group). Codes are also commonly uppercased — if the backend requires it, add an `upperCase` mask on top of `noWhitespace`.

#### 4. Phone fields → `mask: maskPhone` + `prefix: '+62'`

The phone number is stored in the backend as `62xxxxxxxxxx` (no `+`, no leading `0`). The form input uses `prefix: '+62'` to render the country code visually, and `mask: maskPhone` to keep the typed value as digits only (with leading `0` stripped).

```typescript
// ✅ CORRECT
{
  name: 'phone',
  type: 'text',
  label: 'Phone',
  required: true,
  mask: maskPhone,      // ← strips non-digits, caps length
  prefix: '+62',        // ← shown visually, NOT part of form value
}

// ❌ BAD — user can type letters, no length cap, no normalization
{
  name: 'phone',
  type: 'text',
  label: 'Phone',
  required: true,
}
```

**Edit mode:** when seeding `defaultValues` from an existing entity, the stored value is `62xxxxxxxxxx` but the form input only shows the local digits (the `+62` prefix is rendered by the `prefix` prop). Use `stripPhonePrefix(company.phone)` so the field doesn't show `+62 6281234567890` (double prefix). See `src/domains/company/components/CompanyForm.tsx:412`, `src/domains/manpower/components/EmployeeForm.tsx:396`, `src/domains/office/components/OfficeForm.tsx:375`.

```typescript
// ✅ CORRECT
phone: stripPhonePrefix(company.phone),  // "62812..." → "812..."

// ❌ BAD — input shows "+62 62812..." instead of "+62 812..."
phone: company.phone ?? '',
```

### Optional Masks

Use these when the field legitimately accepts special characters or has a known format.

- **`maskNpwp`** — for any NPWP / tax-ID field (format is fixed by Indonesian law).
- **`maskDigits(value, maxLength)`** — for numeric IDs, postal codes, etc. that should never contain letters or exceed a length.

### Writing a Custom Mask

A mask is a pure function `(value: string) => string`. It must be **synchronous**, **pure** (no side effects), and **never throw**. Test edge cases: empty string, max length, paste of large string, leading/trailing whitespace.

```typescript
// Custom mask example — uppercase alphanumeric, max 8 chars
function maskProjectCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}
```

**Applies to:** every text/email/password input that has a defined format. When in doubt, apply `noWhitespace` — it is almost never wrong.

---

## Form Validation Patterns

### Backend Error Display

When the API returns field-level validation errors, pass them to `FormGenerator` via `externalErrors`. The component automatically:
- Displays the first error message under each matching field
- Clears previous external errors when they are removed from the prop
- Works alongside client-side Zod validation

**Example backend error response:**
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

**Data flow:**
```
Page Component → Form Component → FormGenerator(externalErrors)
     ↑
Hook (getFieldErrors) → serverErrors state
```

---

## Button `type` Required for Non-Submit Buttons

⚠️ **This rule is critical and has caused production bugs** (Zod validation firing when user clicks "Batal" / cancel / close).

### The Problem

A bare `<button>` inside a `<form>` defaults to `type="submit"`. When the user clicks a cancel/back/reset button without an explicit `type="button"`, the browser submits the form — which triggers Zod validation, scrolls to the first error, and prevents navigation.

```tsx
// ❌ BAD — defaults to type="submit", triggers Zod validation on click
<Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
  Batal
</Button>
```

### The Fix

Always set `type="button"` on every button inside a form that is NOT the actual submit button. This applies to:

- Cancel / Batal / Back buttons
- Reset buttons
- "Add More" / "Remove" buttons inside `FileInput` or `useFieldArray`
- Drawer close (X) buttons
- Any auxiliary action button rendered inside a form

```tsx
// ✅ GOOD — explicit type="button" prevents form submission
<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
  Batal
</Button>
```

### Reference

Forms that were affected by this bug and have been fixed:

- `payment-type`, `cost-item-type`, `job-item-type`, `project-type`, `project-capability`, `uom`, `item-master`, `skill-master`, `warehouse`, `hierarchy-management`, `vendor-catalog` — all cancel buttons in `<FormActions>` and FormDrawers

### Why Biome Linter Doesn't Catch It

Biome's `noSubmitButton` rule (and similar) is disabled in `biome.json` because it produces too many false positives on submit buttons themselves. There is no reliable linter rule for "non-submit button missing type=button inside a form" because the linter cannot easily track which `<button>` is inside which `<form>`. **You must add `type="button"` manually.**

### Lint Guard for the Future

To prevent regression, add the following to `biome.json` under `linter.rules.a11y`:

```json
"noImplicitButtonType": "error"
```

This biome rule (currently in `2.4.x`+) flags any `<button>` without an explicit `type` attribute. Combine with the existing pattern of explicit `type="submit"` on submit buttons to eliminate this bug class.

---

## Form Validation Patterns

### Component-Level Validation (before submit)
```typescript
// In form submission handler
const result = createRoleSchema.safeParse(formData);
if (!result.success) {
  // Show validation errors to user
  form.setError('root', { message: result.error.errors[0].message });
  return;
}
```

### API-Level Validation (safety net)
```typescript
// In API function
export async function createRole(payload: CreateRequest) {
  const validated = createRoleSchema.parse(payload);
  // If invalid, this throws — caught by React Query and displayed to user
  
  try {
    const { data } = await api.post('/v1/roles', validated);
    return data.data;
  } catch (error) {
    throw new Error(...);
  }
}
```

---

## Best Practices Checklist

- [ ] All form fields defined in constants
- [ ] Field labels, placeholders, options in constants (never hardcoded)
- [ ] Zod schemas for all create/update modes
- [ ] FormGenerator used (never manual inputs)
- [ ] useFormContext() in components for form state
- [ ] Submit button disabled when form invalid
- [ ] Validation at both component and API layers
- [ ] Success/error messages in constants
- [ ] Form reset on success
- [ ] Async operations wrapped in useMutation
- [ ] **Backend field errors passed to FormGenerator via `externalErrors`**
- [ ] `serverErrors` cleared on new form submission (`handleBeforeSubmit`)
- [ ] Error messages displayed to user via form.setError()

---

## Avoid These Patterns

❌ **Hardcoded labels**:
```tsx
<label>Name</label>  // Should be in constants
```

❌ **Manual validation**:
```ts
if (!data.name) throw new Error('Name required');
```

❌ **Manual inputs**:
```tsx
<input type="text" />  // Use FormGenerator
```

❌ **Form state in page**:
```tsx
const [name, setName] = useState('');  // Use React Hook Form
```

❌ **Direct API calls in components**:
```ts
const { data } = await api.post('/v1/roles', formData);
```

❌ **Cancel/back/reset buttons missing `type="button"` inside a form**:
```tsx
<Button variant="outline" onClick={onCancel}>Batal</Button>  // Triggers Zod validation on click
```
See [[#button-type-required-for-non-submit-buttons]] for details.

---

## See Also

- [[API_PATTERN.md]] — API structure and mocking
- [[ERROR_HANDLING_PATTERN.md]] — Handling validation errors from API
