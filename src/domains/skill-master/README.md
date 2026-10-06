# Skill Master

Master data for skill-related entities rendered as a tabbed page with three tabs: Skill Level, Kategori Skill, and Skill Catalog.

## Structure

```
skill-master/
├── api/
│   ├── get-skill-levels.ts          # GET /skill-levels
│   ├── get-skill-categories.ts      # GET /skill-categories
│   ├── get-skill-category.ts        # GET /skill-categories/:id
│   ├── create-skill-category.ts     # POST /skill-categories
│   ├── update-skill-category.ts     # PUT /skill-categories/:id
│   ├── delete-skill-category.ts     # DELETE /skill-categories/:id
│   ├── get-skill-catalogs.ts        # GET /skill-catalogs
│   ├── get-skill-catalog.ts         # GET /skill-catalogs/:id
│   ├── create-skill-catalog.ts      # POST /skill-catalogs
│   ├── update-skill-catalog.ts      # PUT /skill-catalogs/:id
│   └── delete-skill-catalog.ts      # DELETE /skill-catalogs/:id
├── components/
│   ├── SkillCatalogDetailDrawer.tsx    # Detail drawer for skill catalog
│   ├── SkillCatalogForm.tsx            # Create/edit form for skill catalog
│   ├── SkillCategoryDetailDrawer.tsx   # Detail drawer for skill category
│   └── SkillCategoryForm.tsx           # Create/edit form for skill category
├── hooks/
│   ├── use-skill-levels.ts              # useQuery for skill level list
│   ├── use-skill-levels-infinite.ts     # Infinite query for skill levels (AsyncSelect)
│   ├── use-skill-level-page.ts          # Page-level hook for Skill Level tab
│   ├── use-skill-categories.ts          # useQuery for skill category list
│   ├── use-skill-categories-infinite.ts # Infinite query for categories (AsyncSelect)
│   ├── use-skill-category.ts            # useQuery for single skill category
│   ├── use-skill-category-list-page.ts  # Page-level hook for Kategori Skill tab
│   ├── use-create-skill-category.ts     # useMutation for create category
│   ├── use-create-skill-category-page.ts # Create category page orchestration
│   ├── use-edit-skill-category-page.ts  # Edit category page orchestration
│   ├── use-skill-catalogs.ts            # useQuery for skill catalog list
│   ├── use-skill-catalogs-infinite.ts   # Infinite query for catalogs (AsyncSelect)
│   ├── use-skill-catalog.ts             # useQuery for single skill catalog
│   ├── use-skill-catalog-list-page.ts   # Page-level hook for Skill Catalog tab
│   ├── use-create-skill-catalog.ts      # useMutation for create catalog
│   ├── use-create-skill-catalog-page.ts # Create catalog page orchestration
│   ├── use-edit-skill-catalog-page.ts   # Edit catalog page orchestration
│   └── use-update-skill-catalog.ts      # useMutation for update catalog
├── pages/
│   ├── SkillMasterPage.tsx              # Tabbed container page (3 tabs)
│   ├── SkillLevelListContent.tsx        # Skill Level tab content (read-only list)
│   ├── SkillCategoryListContent.tsx     # Kategori Skill tab content
│   ├── SkillCatalogListContent.tsx      # Skill Catalog tab content
│   ├── CreateSkillCategoryPage.tsx      # Create skill category page
│   ├── EditSkillCategoryPage.tsx        # Edit skill category page
│   ├── CreateSkillCatalogPage.tsx       # Create skill catalog page
│   └── EditSkillCatalogPage.tsx         # Edit skill catalog page
├── schemas/
│   └── index.ts                         # Zod schemas for category and catalog forms
├── types/
│   └── index.ts                         # SkillLevel, SkillCategory, SkillCatalog types
├── constants/
│   └── index.ts                         # Labels, tab keys, form field configs
└── index.ts                             # Public barrel exports
```

## Key Files

- `api/get-skill-levels.ts` — Fetches paginated skill levels; read-only, no CRUD
- `api/get-skill-catalogs.ts` — Fetches paginated skill catalogs with search/filter
- `api/get-skill-categories.ts` — Fetches paginated skill categories with search/filter
- `pages/SkillMasterPage.tsx` — Renders the 3-tab container; tab driven by `?tab=` query param
- `hooks/use-skill-levels-infinite.ts` — Infinite-scroll hook for skill level `AsyncSelect`
- `hooks/use-skill-catalogs-infinite.ts` — Infinite-scroll hook for skill catalog `AsyncSelect` (used by other domains such as vendor-catalog)
- `hooks/use-skill-categories-infinite.ts` — Infinite-scroll hook for skill category `AsyncSelect`

## Exports

- `SkillMasterPage` — Top-level tabbed page (Skill Level / Kategori Skill / Skill Catalog)
- `SkillLevelListContent` — Skill Level tab content component
- `SkillCategoryListContent` — Kategori Skill tab content component
- `SkillCatalogListContent` — Skill Catalog tab content component
- `CreateSkillCategoryPage` — Create skill category page
- `EditSkillCategoryPage` — Edit skill category page
- `CreateSkillCatalogPage` — Create skill catalog page
- `EditSkillCatalogPage` — Edit skill catalog page
- `SkillCatalogDetailDrawer` — Read/edit drawer for a skill catalog entry
- `SkillCategoryDetailDrawer` — Read/edit drawer for a skill category entry
- `SkillCatalogForm` / `SkillCategoryForm` — Form components
- `useSkillLevels` — Paginated list query hook
- `useSkillLevelsInfinite` — Infinite-scroll query hook for skill levels
- `useSkillCatalogs` / `useSkillCatalogsInfinite` — List and infinite query hooks
- `useSkillCategories` / `useSkillCategoriesInfinite` — List and infinite query hooks
- `useSkillCatalog` / `useSkillCategory` — Single-item query hooks
- `useCreateSkillCatalog` / `useUpdateSkillCatalog` — Mutation hooks
- `useCreateSkillCategory` — Mutation hook
- `useSkillLevelPage` — Page-level hook for Skill Level tab
- `useSkillCatalogListPage` / `useCreateSkillCatalogPage` / `useEditSkillCatalogPage` — Page hooks for catalog
- `useSkillCategoryListPage` / `useCreateSkillCategoryPage` / `useEditSkillCategoryPage` — Page hooks for category

## Usage Example

```tsx
import { SkillMasterPage } from '@/domains/skill-master';

// app/(protected)/master-data/skill-master/page.tsx
export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <SkillMasterPage />
    </Suspense>
  );
}
```

```tsx
// Using infinite hook in an AsyncSelect from another domain
import { useSkillCatalogsInfinite } from '@/domains/skill-master';

const { options, hasMore, loadMore, isLoading } = useSkillCatalogsInfinite({ search });
```

## Tab Structure

| Tab label | `?tab=` value | Status |
|---|---|---|
| Skill Level | `skill-level` (default) | Implemented — read-only list |
| Kategori Skill | `skill-category` | Implemented — full CRUD |
| Skill Catalog | `skill` | Implemented — full CRUD |

## Route

`/master-data/skill-master` — renders `SkillMasterPage`. Tab state is preserved in the URL via `?tab=<value>`.
