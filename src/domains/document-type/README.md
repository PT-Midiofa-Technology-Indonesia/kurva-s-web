# document-type Domain

Master data for document type definitions rendered as a tabbed page under `/master-data/document`. Document types define which file extensions and maximum file sizes are permitted for uploaded documents. Includes a service layer for converting file-extension flags to/from comma-separated strings.

## Tabs

| Tab | `?tab=` value | Status |
|-----|---------------|--------|
| Document Type | `document-type` | Implemented |
| Daftar Modul | `document-module` | Placeholder |

## Structure

```
document-type/
├── api/
│   ├── create-document-type.ts         # POST /v1/document-types
│   ├── delete-document-type.ts         # DELETE /v1/document-types/{id}
│   ├── get-document-type.ts            # GET /v1/document-types/{id}
│   ├── get-document-types.ts           # GET /v1/document-types
│   └── update-document-type.ts         # PUT /v1/document-types/{id}
├── components/
│   ├── DocumentTypeDetailDrawer.tsx    # Read-only detail drawer
│   └── DocumentTypeForm.tsx            # Shared create/edit form
├── constants/
│   └── index.ts                        # DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_TABS, FILE_TYPE_OPTIONS
├── hooks/
│   ├── use-create-document-type-page.ts   # Page hook for create page
│   ├── use-create-document-type.ts        # Mutation: create
│   ├── use-delete-document-type.ts        # Mutation: delete
│   ├── use-document-type-page.ts          # Page hook for list page
│   ├── use-document-type.ts               # Query: single item by id
│   ├── use-document-types-infinite.ts     # Infinite query for async selects
│   ├── use-document-types.ts              # Query: paginated list
│   ├── use-edit-document-type-page.ts     # Page hook for edit page
│   └── use-update-document-type.ts        # Mutation: update
├── pages/
│   ├── CreateDocumentTypePage.tsx      # Create form page
│   ├── DocumentModuleListContent.tsx   # Daftar Modul placeholder content
│   ├── DocumentPage.tsx                # Tabbed container (tab state via ?tab=)
│   ├── DocumentTypeListPage.tsx        # Document Type tab content
│   └── EditDocumentTypePage.tsx        # Edit form page
├── schemas/
│   ├── index.ts                        # Zod create/edit schemas
│   └── index.test.ts                   # Schema unit tests
├── services/
│   ├── file-types.ts                   # allowedFileTypes string <-> checkbox flags conversion
│   └── file-types.test.ts              # Service unit tests
├── types/
│   └── index.ts                        # DocumentType and payload types
└── index.ts                            # Barrel exports
```

## Key Files

- `services/file-types.ts` — pure functions that convert a checkbox group of extensions (`pdf`, `jpg`, `jpeg`, `png`, `doc`, `docx`, `xls`, `xlsx`) into a comma-separated `allowedFileTypes` string and back
- `pages/DocumentPage.tsx` — tabbed container; tab state preserved in URL via `?tab=<value>` (default: `document-type`)
- `hooks/use-document-types-infinite.ts` — infinite query for `AsyncSelect` use in other domains
- `schemas/index.ts` — Zod schemas for create and edit forms

## Exports

- `DocumentPage` — tabbed container page
- `DocumentTypeListPage` — document type list tab content
- `CreateDocumentTypePage` — create form page
- `EditDocumentTypePage` — edit form page
- `DocumentModuleListContent` — daftar modul placeholder content
- `DocumentTypeDetailDrawer` — read-only detail drawer
- `DocumentTypeForm` — reusable form component
- `useDocumentTypes` — paginated list query hook
- `useDocumentTypesInfinite` — infinite query hook for async selects
- `useDocumentType` — single item query hook
- `useCreateDocumentType` — create mutation hook
- `useUpdateDocumentType` — update mutation hook
- `useDeleteDocumentType` — delete mutation hook
- `useDocumentTypePage` — list page hook
- `useCreateDocumentTypePage` — create page hook
- `useEditDocumentTypePage` — edit page hook

## Usage Example

```tsx
import { DocumentPage } from '@/domains/document-type';

export default function Page() {
  return <DocumentPage />;
}
```
