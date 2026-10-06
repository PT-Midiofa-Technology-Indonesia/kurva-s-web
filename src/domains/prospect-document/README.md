# Prospect Document Domain

Manages required document configurations per prospect pipeline stage — which document types must be submitted at each stage (e.g., Prospect Identify, Qualify, Tender Preparation).

## Structure

```
prospect-document/
├── api/
│   ├── get-prospect-stage-document.ts    # GET /v1/prospect-stage-documents/:stage
│   ├── get-prospect-stage-documents.ts   # GET /v1/prospect-stage-documents (all stages)
│   └── sync-prospect-stage-document.ts  # POST /v1/prospect-stage-documents/:stage/sync
├── components/
│   ├── ProspectDocumentSettingDrawer.tsx # Drawer for editing a stage's required document types
│   └── __tests__/
│       └── ProspectDocumentSettingDrawer.integration.test.tsx
├── constants/
│   └── index.ts                          # Labels and placeholders
├── hooks/
│   ├── use-prospect-document-page.ts     # Page-level hook: drawer open/close state
│   ├── use-prospect-stage-document.ts    # Query: single stage document config
│   ├── use-prospect-stage-documents.ts   # Query: all stages with their document requirements
│   └── use-sync-prospect-stage-document.ts # Mutation: replace document requirements for a stage
├── pages/
│   ├── ProspectDocumentPage.tsx          # List page: table of stages + setting drawer
│   └── __tests__/
│       └── ProspectDocumentPage.integration.test.tsx
├── schemas/
│   └── index.ts                          # Zod: syncProspectStageDocumentSchema
├── types/
│   └── index.ts                          # ProspectStageDocument, ProspectDocumentRequirement
└── index.ts                              # Public barrel exports
```

## Key Files

- `api/sync-prospect-stage-document.ts` — Replaces all document requirements for a stage; accepts `{ documentTypeIds: string[] }`
- `hooks/use-prospect-document-page.ts` — Manages which stage's drawer is open (the only stateful page-level concern)
- `components/ProspectDocumentSettingDrawer.tsx` — Uses `useDocumentTypesInfinite` from the `document-type` domain for infinite-scroll multi-select; submits via `useSyncProspectStageDocument`

## Exports

- `ProspectDocumentPage` — Full list page rendered by `app/(protected)/master-data/prospect-document/page.tsx`
- `ProspectDocumentSettingDrawer` — Drawer component for configuring a single stage's document types
- `useProspectStageDocuments()` — Query hook for all stages with their requirements
- `useProspectStageDocument(stage)` — Query hook for a single stage
- `useSyncProspectStageDocument()` — Mutation hook; replaces requirements on success
- `useProspectDocumentPage()` — Page-level hook for drawer open/close state
- `getProspectStageDocuments`, `getProspectStageDocument`, `syncProspectStageDocument` — Raw API functions
- `ProspectStageDocument`, `ProspectDocumentRequirement` — Core types
- `syncProspectStageDocumentSchema` — Zod schema

## Usage Example

```tsx
// app/(protected)/master-data/prospect-document/page.tsx
import { ProspectDocumentPage } from '@/domains/prospect-document';

export default function Page() {
  return <ProspectDocumentPage />;
}
```

## Related Domains

- **document-type** — `useDocumentTypesInfinite` is used inside `ProspectDocumentSettingDrawer` for the multi-select of available document types
- **prospect** — Uploads against the document types configured here appear as `documentRequirements` in `ProspectDetailModal`
