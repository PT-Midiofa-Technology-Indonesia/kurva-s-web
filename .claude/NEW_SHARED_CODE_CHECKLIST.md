# New Shared Code Creation Checklist

Use this before adding components, hooks, utilities, types, or constants to `src/shared/`.

## Before Creating Anything in @shared

### CRITICAL: Check existing code first!

- [ ] Checked `src/shared/components/` for similar components
- [ ] Checked `src/shared/hooks/` for similar hooks  
- [ ] Checked `src/shared/lib/` for similar utilities
- [ ] Checked `src/shared/types/` for similar types
- [ ] Checked `src/shared/constants/` for similar constants
- [ ] Searched codebase to see if anything similar exists
- [ ] Confirmed this code is truly needed and reusable

**If you found something similar, REUSE IT! Don't create duplicates.**

## Is This Code Shared?

### ✅ YES - Move to @shared if:
- Code used in **2+ domains** OR
- Component is **domain-agnostic** (form field, button, etc.) OR
- Hook is **utility-focused** (debounce, query params, etc.) OR
- Type is **used across domains** OR
- Constant applies **app-wide**

### ❌ NO - Keep in domain if:
- Only used in **1 domain**
- Contains **domain-specific business logic**
- Highly specialized for one context
- Still experimental/unstable

## Adding Shared Components

### Before Creating
- [ ] Checked atoms for similar basic components
- [ ] Checked molecules for similar combinations
- [ ] Checked organisms for similar complex components
- [ ] Decided on appropriate level (atom vs molecule vs organism)
- [ ] Reviewed Atomic Design guidelines

### Component Creation
- [ ] Component file created: `src/shared/components/<level>/<ComponentName>/<ComponentName>.tsx`
- [ ] Types file: `src/shared/components/<level>/<ComponentName>/index.ts`
- [ ] Follows Atomic Design principles
- [ ] Uses TypeScript for full type safety
- [ ] Props documented with JSDoc or TypeScript types
- [ ] Uses @/ path aliases for imports
- [ ] Uses Tailwind CSS classes
- [ ] No hardcoded strings (use props or constants)
- [ ] Exported from `src/shared/components/<level>/index.ts`

### Documentation
- [ ] Component added to `src/shared/components/README.md`
- [ ] Usage example included in README
- [ ] Props documented
- [ ] Storybook story created (if applicable)

## Adding Shared Hooks

### Hook Creation
- [ ] Hook file created: `src/shared/hooks/use-<hook-name>.ts`
- [ ] Follows React hooks conventions
- [ ] Focused on single responsibility
- [ ] Uses TypeScript with proper return type
- [ ] JSDoc comments documenting purpose and parameters
- [ ] Exported from `src/shared/hooks/index.ts`

### Documentation
- [ ] Hook added to `src/shared/hooks/README.md`
- [ ] Usage examples provided
- [ ] Parameters and return type documented
- [ ] Common use cases shown

## Adding Shared Utilities/Lib

### Utility Creation
- [ ] Utility function created in appropriate file:
  - `src/shared/lib/axios.ts` — HTTP client
  - `src/shared/lib/api-error.ts` — Error handling
  - `src/shared/lib/utils.ts` — General utilities
  - Or new file if needed
- [ ] Function is pure (no side effects)
- [ ] Documented with JSDoc
- [ ] Typed with TypeScript
- [ ] Exported from file

### Documentation
- [ ] Utility added to `src/shared/lib/README.md`
- [ ] Usage examples provided
- [ ] Parameters and return values documented

## Adding Shared Types

### Type Creation
- [ ] Type defined in appropriate file:
  - `src/shared/types/api.ts` — API response types
  - `src/shared/types/permissions.ts` — Permission types
  - `src/shared/types/query-params.ts` — Query param types
  - Or new file if needed
- [ ] Type exported from `src/shared/types/index.ts`
- [ ] Type is reused across domains (not domain-specific)
- [ ] Documented with JSDoc

### Documentation
- [ ] Type added to `src/shared/types/README.md`
- [ ] Usage examples provided
- [ ] Related types linked

## Adding Shared Constants

### Constant Creation
- [ ] Constant added to appropriate file:
  - `src/shared/constants/index.ts` — Common labels, options
  - `src/shared/constants/navigation.tsx` — Navigation config
  - Or new file if needed
- [ ] Constant is app-wide (not domain-specific)
- [ ] Well-named and organized
- [ ] Exported properly

### Documentation
- [ ] Constant added to `src/shared/constants/README.md`
- [ ] Usage examples provided
- [ ] Explains when and why to use

## Workspace Documentation Updates

If major addition to @shared, update:
- [ ] Main `src/shared/README.md` — Add to quick reference or relevant section
- [ ] Specific README in subdirectory:
  - `src/shared/components/README.md` for components
  - `src/shared/hooks/README.md` for hooks
  - `src/shared/lib/README.md` for utilities
  - etc.

## Final Verification

- [ ] All imports use `@/` path aliases
- [ ] TypeScript check passes: `pnpm run type-check`
- [ ] No hardcoded strings (use constants)
- [ ] No circular dependencies
- [ ] Code follows project conventions
- [ ] Documentation is complete and clear
- [ ] Exported from `index.ts` in directory
- [ ] Imported successfully in test file

## Common Patterns

### Shared Component Pattern
```typescript
// src/shared/components/atoms/MyComponent/MyComponent.tsx
export interface MyComponentProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function MyComponent({ label, value, onChange }: MyComponentProps) {
  return (/* ... */);
}

// src/shared/components/atoms/MyComponent/index.ts
export { MyComponent, type MyComponentProps } from './MyComponent';

// src/shared/components/atoms/index.ts
export { MyComponent } from './MyComponent';
```

### Shared Hook Pattern
```typescript
// src/shared/hooks/use-my-hook.ts
/**
 * Description of what this hook does
 * @param param1 - Description
 * @returns Description of return value
 */
export function useMyHook(param1: string) {
  // Implementation
  return result;
}
```

### Shared Utility Pattern
```typescript
// src/shared/lib/utils.ts
/**
 * Description of what this function does
 * @param param1 - Description
 * @returns Description of return value
 */
export function myUtility(param1: string): string {
  // Implementation
  return result;
}
```

## Need Help?

See detailed guides:
- [src/shared/README.md](../src/shared/README.md) — Complete @shared guide
- [src/shared/components/README.md](../src/shared/components/README.md) — Component patterns
- [src/shared/hooks/README.md](../src/shared/hooks/README.md) — Hook examples
- [src/shared/lib/README.md](../src/shared/lib/README.md) — Utility patterns
- [CLAUDE.md](../CLAUDE.md) — Project conventions

---

**Remember:** Always check @shared first before creating new code!
