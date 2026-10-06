# Quick Reference — What Pattern Do I Need?

This is your decision tree. Pick your situation, jump to the right pattern.

> **⚠️ Before You Start**: Always read [CLAUDE.md](/CLAUDE.md) first! It contains project-specific rules, anti-patterns to avoid, and critical workflow guidelines that prevent common bugs.

> **💡 Pro tip**: When you update documentation, the knowledge graph automatically syncs via the PostToolUse hook

---

## I'm Building a New Feature

### **I'm creating a new domain**

→ Start with [[CLAUDE.md#when-adding-a-new-domain]] for directory structure
→ Create README.md in domain with overview, structure, exports, examples
→ Update documentation links

---

### **I'm adding an API call**

→ See [[API_PATTERN.md]]

- One file per operation (get-users.ts, create-user.ts)
- Check mock flag, validate with Zod, try/catch, throw errors
- Return unwrapped data, type the response
- Create React Query hook in hooks/
- **Define `<DOMAIN>_QUERY_KEYS` in the list hook (`use-<entities>.ts`) and import it everywhere** — never write raw `queryKey: ['...']` strings

---

### **I'm building a form**

→ See [[FORMS_PATTERN.md]]

- Define fields in constants (labels, placeholders, options)
- **Create Zod schemas in `schemas/index.ts`** — export as `create<Entity>Schema` / `edit<Entity>Schema`; never inline `z.object()` in a form component
- **Reuse shared schemas** — see [[SCHEMA_PATTERN.md]] for `codeRequiredSchema`, `nameRequiredSchema`, `isActiveSchema`, `simpleCreateSchema`, etc.
- Use FormGenerator component (never manual inputs)
- **Wrap form in `<FormCard>`** from `@/components/molecules`
- useFormContext() in components
- Disable submit when form.isValid is false
- **Pass backend field errors via `externalErrors`** — see [[ERROR_HANDLING_PATTERN.md]] for the full pattern
- **Apply mandatory input masks** — `mask: noWhitespace` on every `email` / `password` field, `mask: maskPhone` + `prefix: '+62'` on every `phone` field, `stripPhonePrefix()` for phone `defaultValues` in edit mode — see [[FORMS_PATTERN.md#input-masks]]

---

### **I'm building a detail drawer**

→ Use `DetailDrawerTemplate` from `@/components/templates`

- Handles shell: backdrop overlay, 512px slide-in panel, header with X, scrollable body, Edit/Close footer
- Pass `title`, `open`, `onClose`, `onEdit`, `editLabel`, `closeLabel`
- Pass field rows as `children`
- Pass `<ConfirmDialog>` as `confirmDialog` prop (rendered outside the panel, inside the overlay)
- Keep all status-toggle state and mutation logic in the domain component
- **All `<ConfirmDialog>` strings from constants** — add `DETAIL.DIALOG.CHANGE_STATUS_*` to the domain's constants, never hardcode

```tsx
// domain constants/index.ts
DETAIL: {
  DIALOG: {
    CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
    CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status <entity> ini.',
    CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
  },
}

// *DetailDrawer.tsx
<DetailDrawerTemplate
  open={open} onClose={onClose} onEdit={onEdit}
  title={labels.PAGE_TITLE}
  editLabel={labels.BUTTONS.EDIT}
  closeLabel={labels.BUTTONS.CLOSE}
  confirmDialog={
    <ConfirmDialog
      title={labels.DIALOG.CHANGE_STATUS_TITLE}
      description={labels.DIALOG.CHANGE_STATUS_DESCRIPTION}
      cancelText={labels.DIALOG.CHANGE_STATUS_CANCEL}
      confirmText={labels.DIALOG.CHANGE_STATUS_CONFIRM}
      ...
    />
  }
>
  {/* field rows */}
</DetailDrawerTemplate>
```

---

### **I'm creating a list/index page**

→ See [[LIST_PAGES_PATTERN.md]]

- Always use ListPageTemplate (no custom shells)
- Create use-<domain>-page.ts hook for all logic
- Page is 100% UI only
- Define columns in page component
- Reuse existing list/filter pattern only when behavior is identical
- If reset rules, tabs, permissions, or query-param semantics differ, keep page-specific handler local

→ Then also see [[QUERY_PARAMS_PATTERN.md]]

- URL params are always strings
- Convert strings → typed API params in useMemo
- Use useQueryParams hook for URL sync
- Pass params with defaults to ListPageTemplate

---

## I'm Debugging or Fixing Something

### **An error is happening in my form / API call**

→ See [[ERROR_HANDLING_PATTERN.md]]

- Type catch blocks as AxiosError<ApiErrorResponse>
- Use error extractors: getErrorMessage(), getErrorCode(), getFieldErrors()
- **With FormGenerator: pass `externalErrors` prop** — FormGenerator handles field-level error display automatically
- Without FormGenerator: use form.setError() or toast
- Never return error objects from API — throw

---

### **A list page isn't showing data or sorting wrong**

→ Check [[LIST_PAGES_PATTERN.md]] — verify:

- Hook returns correct data structure
- URL params converted to typed params
- ListPageTemplate receives params.sortBy (with defaults), not queryParams.sortBy
- Filter logic in useMemo

---

### **Buttons are unresponsive / tabs don't work / hydration errors**

→ See [[LIST_PAGES_PATTERN.md]] — verify:

- Tabbed `page.tsx` is a **Server Component** (no `'use client'`) wrapping tab component in `Suspense`
- Never use `window.location.pathname` — use `usePathname()` from `next/navigation`
- Hook options objects wrapped in `useMemo` before passing to page hooks
- `router.replace(url, { scroll: false })` for tab switching (not `router.push`)

### **A form isn't validating correctly**

→ Check [[FORMS_PATTERN.md]] — verify:

- Zod schema matches field names
- FormGenerator fields have correct `name` properties
- useFormContext() used in components (not prop-drilling)
- form.formState.isValid used for submit button disabled state

---

### **Search/filter isn't updating the URL**

→ Check [[QUERY_PARAMS_PATTERN.md]] — verify:

- useQueryParams hook used
- updateQueryParam() for single changes, setQueryParams() for batch
- Passing undefined (not empty string) to clear params
- URL type defined as separate interface from API params

---

## I'm Creating a Shared Component

### **Should this be shared first?**

Check this before extracting anything:

- Need at least 3 real call sites with same behavior, not only similar markup
- Same reset rules, permissions, query params, loading states, submit flow, and lifecycle
- No extra `variant`, `mode`, optional callback, or branching needed to force fit page-specific behavior
- Goal must be bug reduction and one source of truth, not only fewer lines

If any check fails, keep code inside domain/page.

**Bad** ❌

- 2 pages both have company selector
- page A resets `momId`
- page B preserves `tab`
- forced into 1 shared `handleCompanyChange({ resetTab, resetMomId, resetStatus })`

**Good** ✅

- share `useCompanyFilter()` for source of truth
- keep page-specific reset handler in each page
- extract only pure identical part

### **I'm adding an atom, molecule, or organism to shared/components/**

→ See [[practices/06-storybook.md]]

- Create Component.tsx
- Create Component.test.tsx with unit tests (minimum 3 test cases)
- Create Component.stories.tsx with 3+ story variants
- Document all props, states, and edge cases in stories
- Test with `pnpm run storybook`

---

## Common Tasks

### **Add a column to a list table**

1. Open page component
2. Add ColumnDef to columns array in useMemo
3. Add header string to constants
4. Re-run tests

---

### **Add Excel mode (active cell / range copy-paste / marching ants) to a list page**

→ See [[DATATABLE_PATTERN.md]]

- Set `enableRangeSelection` and `onCellEdit` on `<DataTable>`
- In your context menu, call `triggerCopy()` for range copy (never call `navigator.clipboard.writeText` directly for ranges — only `triggerCopy` sets the marching-ants state)
- Mark columns editable with `meta.editable: true` + `meta.editType`
- In `onCellEdit`, convert the pasted text to the column's underlying value (e.g., `"Aktif" → true`)

---

### **Add a filter to a list page**

1. Add param to URL type (as string)
2. Add conversion logic in useMemo (string → typed)
3. Create filter UI component (select, date picker, etc.)
4. Pass to ListPageTemplate `filters` prop
5. Add API parameter to hook
6. If filter reset behavior differs from other pages, keep reset handler local instead of forcing shared abstraction

---

### **Add a new form field**

1. Add to FORM_FIELDS in constants
2. Add to Zod schema in schemas/
3. FormGenerator automatically renders it
4. Add validation message to schema

---

### **Change error handling in a mutation**

1. Find the useMutation with mutationFn
2. Update onError handler
3. Use `getErrorMessage()` to extract general message
4. Use `getFieldErrors()` to extract field-level errors
5. **For forms with FormGenerator**: Set `serverErrors` state with field errors, pass via `externalErrors` prop
6. **For manual forms**: Use `form.setError()` or toast

---

### **Add field-level validation errors (Backend Errors)**

1. Hook: Import `getFieldErrors` from `@/lib/api-error`
2. Hook: Add `serverErrors` state with `useState<Record<string, string[]>>({})`
3. Hook: Clear `serverErrors` in `handleBeforeSubmit` before opening confirm dialog
4. Hook: In mutation `onError`, call `setServerErrors(getFieldErrors(error) || {})`
5. Hook: Expose `serverErrors` in return object
6. Page: Destructure `serverErrors` from hook and pass to form component
7. Form component: Accept `serverErrors?: Record<string, string[]>` prop
8. Form component: Pass `externalErrors={serverErrors}` to `<FormGenerator>`
9. FormGenerator automatically displays errors under matching fields

---

## File Organization Reference

```
src/domains/<domain>/
│
├── api/                    → See [[API_PATTERN.md]]
│   ├── get-<entity>.ts    # GET single
│   ├── get-<entities>.ts  # GET paginated list
│   ├── create-<entity>.ts # POST
│   ├── update-<entity>.ts # PATCH
│   └── delete-<entity>.ts # DELETE
│
├── hooks/                  → React Query hooks
│   ├── use-<entity>.ts
│   ├── use-<entities>.ts
│   ├── use-create-<entity>.ts
│   └── use-<domain>-page.ts  → See [[LIST_PAGES_PATTERN.md]]
│
├── components/             → Domain-specific UI
│   ├── <Entity>Form.tsx        → See [[FORMS_PATTERN.md]]
│   ├── <Entity>ActionsCell.tsx
│   └── ...
│
├── pages/                  → Page-level components
│   ├── <Domain>ListPage.tsx        → See [[LIST_PAGES_PATTERN.md]]
│   ├── Create<Entity>Page.tsx
│   ├── Edit<Entity>Page.tsx
│   └── <Entity>DetailPage.tsx
│
├── constants/              → All labels, strings, field configs
│   └── index.ts                → See [[FORMS_PATTERN.md]], [[LIST_PAGES_PATTERN.md]]
│
├── schemas/                → Zod validation
│   └── <entity>.schema.ts      → See [[FORMS_PATTERN.md]]
│
├── types/                  → TypeScript types & interfaces
│   └── index.ts
│
├── mocks/                  → Mock data (if NEXT_PUBLIC_USE_MOCK=true)
│   └── data.ts
│
└── index.ts                → Public barrel exports
```

---

## Reference Quick Links

| Task                         | Pattern                                              |
| ---------------------------- | ---------------------------------------------------- |
| Create API function          | [[API_PATTERN.md]]                                   |
| Create form                  | [[FORMS_PATTERN.md]]                                 |
| Create / refactor Zod schema | [[SCHEMA_PATTERN.md]]                                |
| Create list page             | [[LIST_PAGES_PATTERN.md]]                            |
| Handle URL params            | [[QUERY_PARAMS_PATTERN.md]]                          |
| Handle errors                | [[ERROR_HANDLING_PATTERN.md]]                        |
| Build detail drawer          | `DetailDrawerTemplate` from `@/components/templates` |
| Wrap a form component        | `FormCard` from `@/components/molecules`             |
| Create shared component      | [[practices/06-storybook.md]]                        |
| Add new domain               | [[CLAUDE.md#when-adding-a-new-domain]]               |

---

## Still Stuck?

- Check existing domains for examples
- See SOLID_CLEAN_ARCHITECTURE.md for architectural principles
- Read domain README.md files for domain-specific guidance
