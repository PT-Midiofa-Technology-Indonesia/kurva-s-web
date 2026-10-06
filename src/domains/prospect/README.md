# Prospect Domain

Manages the prospect pipeline as a kanban board grouped by stage, with per-project detail (documents, activity log, stage history) and drag-and-drop stage transitions.

## Structure

```
prospect/
├── api/
│   ├── create-project-activity.ts      # POST /projects/:id/activities
│   ├── create-prospect.ts              # POST /v1/prospects
│   ├── delete-activity-document.ts     # DELETE /projects/:id/activities/documents/:docId
│   ├── delete-project-document.ts      # DELETE /projects/:id/documents/:uploadedDocId
│   ├── get-project-stage-history.ts    # GET /projects/:id/stage-history
│   ├── get-prospect-detail.ts          # GET /projects/:id
│   ├── get-prospects.ts                # GET /v1/prospects (grouped by stage)
│   ├── update-project-document.ts      # PUT /projects/:id/documents/:uploadedDocId (multipart)
│   ├── update-prospect-stage.ts        # PUT /v1/prospects/:id/stage
│   ├── upload-activity-document.ts     # POST /projects/:id/activities/documents (multipart)
│   └── upload-project-document.ts      # POST /projects/:id/documents (multipart)
├── components/
│   ├── CreateProspectDrawer.tsx        # Slide-over form to create a new prospect
│   ├── ProspectActivityDocumentRow.tsx # Inline activity attachment row with delete
│   ├── ProspectDetailModal.tsx         # Full-screen modal: Project Info / Documents / Activity tabs
│   ├── ProspectDocumentRow.tsx         # Required-document row with upload, progress, replace, delete
│   └── ProspectStageHistoryModal.tsx   # Stage transition history modal
├── constants/
│   └── index.ts                        # PROSPECT_LABELS, PROSPECT_READONLY_STAGES
├── hooks/
│   ├── use-create-project-activity.ts  # Mutation: post activity note
│   ├── use-create-prospect.ts          # Mutation: create prospect
│   ├── use-delete-activity-document.ts # Mutation: delete activity attachment
│   ├── use-delete-project-document.ts  # Mutation: delete required document
│   ├── use-project-stage-history.ts    # Query: stage history entries
│   ├── use-prospect-detail.ts          # Query: single project detail
│   ├── use-prospect-page.ts            # Page-level hook: company selector, drawer state, kanban
│   ├── use-prospects.ts                # Query: pipeline stages by companyId
│   ├── use-update-project-document.ts  # Mutation: replace an uploaded document
│   ├── use-update-prospect-stage.ts    # Mutation: move prospect to a new stage
│   ├── use-upload-activity-document.ts # Mutation: upload activity attachment (multipart)
│   └── use-upload-project-document.ts  # Mutation: upload required document (multipart)
├── pages/
│   ├── ProspectPage.tsx                # Kanban board with company selector
│   └── __tests__/
│       └── ProspectPage.integration.test.tsx
├── schemas/
│   └── index.ts                        # Zod schemas for prospect forms
├── services/
│   └── prospect-service.ts             # mapProspectsToKanbanColumns transformer
├── types/
│   └── index.ts                        # ProspectStage, ProspectDetail, StageHistoryEntry, etc.
└── index.ts                            # Public barrel exports
```

## Key Files

- `api/get-prospects.ts` — Fetches all pipeline stages for a company; response is `ProspectStage[]`
- `api/get-prospect-detail.ts` — Full project detail including `documentRequirements` and `activities`
- `hooks/use-prospect-page.ts` — Page-level hook: shared company filter, kanban drag state, create-drawer open state
- `services/prospect-service.ts` — `mapProspectsToKanbanColumns(stages)` transforms API `ProspectStage[]` into `KanbanColumnConfig[]` for the shared `KanbanBoard`

## Exports

- `ProspectPage` — Kanban board page with company dropdown and create-prospect drawer
- `useProspects(companyId)` — Pipeline stages query
- `useProspectPage()` — Page-level hook: company selector, drawer state, kanban state
- `useProspectDetail(projectId)` — Single project detail query
- `useProjectStageHistory(projectId)` — Stage history query
- `useCreateProspect()` — Mutation: create prospect
- `useUpdateProspectStage(companyId)` — Mutation: move prospect to a new stage
- `useCreateProjectActivity(projectId)` — Mutation: post activity note
- `useUploadActivityDocument(projectId)` — Mutation: upload activity attachment
- `useDeleteActivityDocument(projectId)` — Mutation: delete activity attachment
- `useUploadProjectDocument(projectId)` — Mutation: upload required document
- `useUpdateProjectDocument(projectId)` — Mutation: replace required document
- `useDeleteProjectDocument(projectId)` — Mutation: delete required document
- `createProspect`, `getProspects`, `getProspectDetail`, `getProjectStageHistory`, `createProjectActivity`, `uploadActivityDocument`, `deleteActivityDocument`, `uploadProjectDocument`, `updateProjectDocument`, `deleteProjectDocument`, `updateProspectStage` — Raw API functions
- All types from `types/`, schemas from `schemas/`

## Usage Example

```tsx
// app/(protected)/prospectus/prospect/page.tsx
import { ProspectPage } from "@/domains/prospect";

export default function Page() {
  return <ProspectPage />;
}
```

## Key Behaviors

- **Company selection** — top-right dropdown; synced to `companyId` URL query param. Prospect list stays disabled until a company is selected.
- **Kanban drag-and-drop** — moving a card triggers `useUpdateProspectStage`; stages in `PROSPECT_READONLY_STAGES` are locked.
- **Detail modal tabs** — Project Info, Documents (required doc checklist with upload/replace/delete), Activity (notes + file attachments).
- **Stage history** — `ProspectStageHistoryModal` lists transitions newest-first with actor, timestamp, notes, and attachments.
- **File uploads** — all multipart uploads expose `onUploadProgress` for progress-bar display.

## Related Domains

- **company** — company list used in the dropdown selector
- **shared KanbanBoard** — `src/shared/components/organisms/KanbanBoard`
