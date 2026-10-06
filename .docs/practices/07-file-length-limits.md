# File Length Limits

Excessively long files (>500 lines) violate the **Single Responsibility Principle** and make code harder to maintain, test, and review.

## File Size Thresholds

| File Type | Ideal Limit | Max Limit | Rationale |
|---|---|---|---|
| Component | 150–200 lines | 300 lines | Focused rendering logic |
| Hook | 50–100 lines | 150 lines | Single orchestration responsibility |
| Service | 100–200 lines | 300 lines | Pure domain logic |
| Page | 200–300 lines | 500 lines | State & layout orchestration |

## When to Split

- File exceeds **500 lines** (or 300 lines for components, services, or hooks).
- File has **multiple responsibilities** (e.g., UI rendering + complex validation + data transformation).
- UI or data transformation logic can be reused elsewhere.

## Refactoring Strategies

1. **Extract Sub-components**: Break down large UI components into smaller molecules/organisms.
2. **Extract Custom Hooks**: Move state management and React Query logic out of pages/components.
3. **Extract Pure Services**: Move data transformation logic into `services/`.
4. **Extract Form Fields / Columns**: For giant tables or forms, move column definitions or schemas into standalone files in `constants/` or `schemas/`.

## Notes

- **Exceptions**: Mock data files (`src/mocks/`), Storybook examples (`*.stories.tsx`), and auto-generated code.
- **Enforcement**: Guideline and warning-level concern, not a hard build-blocker. When adding features to a large legacy file, prioritize extracting related components/hooks rather than performing a full rewrite all at once.
