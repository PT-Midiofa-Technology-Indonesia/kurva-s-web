# New Domain Creation Checklist

Use this checklist when creating a new domain. **Documentation is mandatory!**

## Pre-Creation

- [ ] Reviewed existing domains to avoid duplication
- [ ] Confirmed domain doesn't already exist in `src/domains/`
- [ ] Identified domain purpose and related domains

## Domain Creation

- [ ] Created directory: `src/domains/<domain-name>/`
- [ ] Created subdirectories:
  - [ ] `api/`
  - [ ] `hooks/`
  - [ ] `components/`
  - [ ] `pages/`
  - [ ] `types/`
  - [ ] `constants/`
  - [ ] `schemas/`
  - [ ] `store/` (if needed)
  - [ ] `services/` (if needed)

- [ ] Created `src/domains/<domain-name>/index.ts` with public barrel exports
- [ ] Implemented domain APIs, hooks, pages, types

## README.md Creation (MANDATORY!)

- [ ] Created `src/domains/<domain-name>/README.md`
- [ ] Added sections:
  - [ ] Overview (what this domain does)
  - [ ] Structure (directory layout with tree diagram)
  - [ ] Key Exports (APIs, Hooks, Pages, Components, Types)
  - [ ] Usage Examples (code samples)
  - [ ] API Contracts (request/response formats)
  - [ ] Related Domains (cross-domain dependencies)
  - [ ] Best Practices

See template: [src/domains/README.md — README.md Template](../src/domains/README.md#readmemd-template-for-new-domains)

## Documentation Links (MANDATORY!)

**Update 3 documentation files:**

### 1. Update src/domains/README.md

Add domain link to "Domains Overview" section under appropriate category:

```markdown
- **[domain-name](./domain-name/README.md)** — Brief description of what domain does
```

Example:
```markdown
#### User & Access Management
- **[auth](./auth/README.md)** — Authentication, login, logout, token management
- **[my-new-domain](./my-new-domain/README.md)** — My new domain description
```

### 2. Update DOCUMENTATION_INDEX.md

Add domain link to "Domain & Feature Documentation" section:

```markdown
- [src/domains/my-new-domain/README.md](src/domains/my-new-domain/README.md) — Brief description
```

### 3. Update main README.md (if major domain)

Add link to documentation section if this is a major domain (auth, users, etc.)

## Documentation Checklist

- [ ] `README.md` created in `src/domains/<domain-name>/`
- [ ] Domain added to `src/domains/README.md` (Domains Overview section)
- [ ] Domain added to `DOCUMENTATION_INDEX.md` (Domain & Feature Documentation section)
- [ ] Main `README.md` updated (if major domain)

## Verification

- [ ] All exports in `index.ts` are correct
- [ ] TypeScript type check passes: `pnpm run type-check`
- [ ] All documentation links are valid and working
- [ ] Imported domain successfully in test: `import { /* */ } from '@/domains/domain-name'`

## Common Domain Examples

### Simple Master Data Domain (Project Type, Payment Type, etc.)

**Structure:**
```
domain-name/
├── api/                    # get-*, create-*, update-*, delete-*
├── hooks/                  # use-*, use-*-page
├── components/             # *Form.tsx, *List.tsx
├── pages/                  # *ListPage, Create*Page, Detail*Page
├── types/                  # Domain types
├── constants/              # Labels, form fields
└── index.ts
```

**README.md Key Sections:**
1. Overview (brief description)
2. Structure
3. Key Exports (list all APIs, hooks, pages)
4. Usage Examples
5. API Contracts
6. Related Domains
7. Best Practices

### Complex Domain (Auth, Users, Role Permissions)

**Additional items:**
- [ ] `schemas/` — Zod validation schemas
- [ ] `services/` — Data transformation
- [ ] `store/` — Zustand store (if global state needed)
- [ ] Complex usage examples in README

## After Creation

1. ✅ Share domain with team via README.md
2. ✅ Add any reusable components to `@/shared` if used in multiple domains
3. ✅ Link to documentation from related domains
4. ✅ Keep README.md updated as domain evolves

## Quick Reference

**Domain creation command:**
```bash
mkdir -p src/domains/<domain-name>/{api,hooks,components,pages,types,constants,schemas}
touch src/domains/<domain-name>/index.ts
touch src/domains/<domain-name>/README.md
```

**Files to update:**
1. `src/domains/<domain-name>/README.md` — Create with full documentation
2. `src/domains/README.md` — Add link in Domains Overview section
3. `DOCUMENTATION_INDEX.md` — Add link in Domain & Feature Documentation section
4. `README.md` — Update if major domain

## Need Help?

See detailed guide: [src/domains/README.md — Adding a New Domain](../src/domains/README.md#adding-a-new-domain)

Existing domain examples:
- [auth](../src/domains/auth/README.md)
- [users](../src/domains/users/README.md)
- [role-permissions](../src/domains/role-permissions/README.md)
- [project-type](../src/domains/project-type/README.md)

---

**Remember:** Documentation is mandatory! Every domain needs README.md and workspace links.
