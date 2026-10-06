# DataTable — Reference

Covers: sticky headers, tree view, Excel mode (active cell, range selection, keyboard copy/paste, marching-ants), and context menu integration.

See [DataTable.tsx](../../src/shared/components/organisms/DataTable/DataTable.tsx) and [DataTable.stories.tsx](../../src/shared/components/organisms/DataTable/DataTable.stories.tsx).

---

## Quick Rules

- **Enable with `enableRangeSelection`** — also turns on the active-cell outline, keyboard nav, copy/paste, and marching ants
- **Provide `onCellEdit` for paste to work** — paste calls `onCellEdit(rowIndex, columnId, value)` per cell
- **In the context menu, use `triggerCopy` for range copy** — never call `navigator.clipboard.writeText` directly; the DataTable's copy pipeline is the only path that sets the marching-ants state
- **Active cell uses `outline`, not `border`** — never re-introduce `border` on the active cell (causes 2px layout shift)
- **Ants clear on paste and Escape only** — cell click and drag-select do **not** clear (Excel-like: ants persist while you browse to pick a paste target)
- **Tree view chevron is inlined into the first data column** — there is no separate expand column; `enableTreeView` controls whether the chevron appears in the cell at `treeColumnIndex`
- **Sticky header requires `stickyHeader` prop** — scrolls correctly because `overflow-y-auto` is applied directly to the table-container div, not an outer wrapper

---

## Sticky Header

```tsx
<DataTable
  data={rows}
  columns={columns}
  stickyHeader          // header row sticks to the top while scrolling
  enablePagination={false}
/>
```

### How it works

`stickyHeader` applies `overflow-y-auto` and `max-h-100` (400 px) **directly to the shadcn `Table`'s inner `div[data-slot="table-container"]`** via the Tailwind variant `*:data-[slot=table-container]:overflow-y-auto`. This is required because the table-container already has `overflow-x: auto`, which forces `overflow-y` to a non-visible value — making it the scroll container for sticky elements. If `overflow-y-auto` were on an outer wrapper instead, the sticky `<th>` elements would bind to the unconstrained inner div and never stick.

Header cells get `sticky top-0` plus an explicit `background-color: var(--background)` and a `color-mix(in srgb, var(--muted) 50%, transparent)` gradient overlay so they fully cover scrolling rows. **CSS variables must be used as-is** — wrapping them in `hsl()` produces invalid CSS when the variable already holds a hex value.

### Sticky columns alongside sticky header

```tsx
<DataTable stickyHeader stickyColumns={2} ... />
```

First `N` columns get `sticky left-{offset}`. The header corner cells that are both vertically and horizontally sticky receive `z-30` to stay above both ordinary sticky headers (`z-10`) and ordinary sticky body cells (`z-10`).

---

## Tree View

```tsx
<DataTable
  data={rows}           // rows may have a `children` field (or use getSubRows)
  columns={columns}
  enableTreeView
  enablePagination={false}
/>
```

### Inlined expand column

The expand/collapse chevron is rendered **inside the first data column's cell**, not in a separate narrow column. The column index is computed as:

```ts
const treeColumnIndex = enableTreeView ? (enableRowSelection ? 1 : 0) : undefined;
```

Each cell at `treeColumnIndex` is wrapped in a flex container with `paddingLeft: row.depth * 16` for depth indentation. Rows that can expand show a `ChevronRight`/`ChevronDown` button; leaf rows get a `<span>` placeholder of the same size to keep text aligned.

### Custom sub-rows

Pass `getSubRows` to use a field other than `children`:

```tsx
<DataTable
  data={orgData}
  columns={orgColumns}
  enableTreeView
  getSubRows={(row) => row.subItems}
/>
```

### Tree + grouped headers (`headerColumnTree`)

Use `headerColumnTree` to define multi-level column headers as a node tree. The `prefixCount` passed to `buildHeaderRows` accounts only for the selection column (not a separate expand column, since there is none):

```ts
const prefixCount = enableRowSelection ? 1 : 0;
```

---

## Enabling Excel Mode

```tsx
<DataTable
  data={rows}
  columns={columns}
  enableRangeSelection          // ← turns everything on
  onCellEdit={handleCellEdit}   // ← required for paste
  contextMenu={handleContextMenu}
/>
```

That's it. No additional config. `enableCellNavigation` is auto-enabled when `enableRangeSelection` is true (via `enableCellNavigation ?? !!enableRangeSelection`).

---

## Visual Behavior

### Active cell — solid outline, no layout shift

The active cell is drawn with `outline` (not `border`) so the cell's box size never changes. The negative `-outline-offset-2` keeps the outline drawn **inside** the cell, so it doesn't get clipped by `overflow-hidden` on `<TableCell>`.

```tsx
// DataTable.tsx:197
isActiveCell && !isEditing && 'outline outline-2 outline-cyan-500 -outline-offset-2 z-10'
```

| State                  | Visual                                                                |
| ---------------------- | --------------------------------------------------------------------- |
| Active cell (idle)     | `outline outline-2 outline-cyan-500 -outline-offset-2` (solid 2px cyan, drawn inside) |
| Active cell (editing)  | No outline; the editor takes over                                     |
| Range selection        | `bg-primary/10` background + 2px primary border on the 4 edge cells. The table uses `border-separate border-spacing-0`, so adjacent cell borders sit flush and form a continuous outline. |
| Copied range cell      | `outline outline-[1.5px] outline-dashed outline-slate-700/80 -outline-offset-[1.5px] animate-marching-ants` |
| Active + copied        | Active cell shows solid cyan, the rest of the range animates dashed   |

### Marching-ants animation

Defined in [src/styles/globals.css](../../src/styles/globals.css) — `@keyframes marching-ants` animates `outline-offset` from `-1.5px` to `-6.5px` (5px seamless shift). The `--animate-marching-ants` theme token is set in the same file.

A `@media (prefers-reduced-motion: reduce)` block disables the animation for users who request it:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-marching-ants {
    animation: none;
  }
}
```

### Range border — one continuous outline

The `<Table>` element uses `className="border-separate border-spacing-0"`. With zero spacing, adjacent cell borders sit directly against each other without gaps, so the per-edge `border-t-2 border-b-2 border-l-2 border-r-2` applied to range edge cells visually forms one continuous 2px outline around the range.

`border-separate` (rather than `border-collapse`) is required for sticky headers to render their backgrounds correctly — `border-collapse` causes browsers to skip painting sticky cell backgrounds over scrolling content.

---

## State Model

| State             | Type                                          | Where it lives                          |
| ----------------- | --------------------------------------------- | --------------------------------------- |
| `activeCell`      | `CellPos \| null`                             | Component state                         |
| `rangeAnchor`     | `CellPos \| null`                             | Component state + ref                   |
| `rangeFocus`      | `CellPos \| null`                             | Component state + ref                   |
| `isRangeSelecting`| `boolean`                                     | Component state                         |
| `copiedRange`     | `{ anchor: CellPos; focus: CellPos } \| null` | Component state                         |

The `*Ref` mirrors (`rangeAnchorRef`, `rangeFocusRef`, `activeCellRef`) are written **synchronously** inside mousedown / mouseenter / keydown handlers so the next keypress can read the latest value without waiting for a re-render. This fixes the lost-Ctrl+C bug where a key press fired in the same frame as a state update would read stale refs.

---

## Copy / Paste

### Copy — `performCopy`

`performCopy` ([DataTable.tsx:875](../../src/shared/components/organisms/DataTable/DataTable.tsx)) is a `useCallback` that:

1. Reads `rangeAnchorRef` / `rangeFocusRef` (always current values)
2. Computes `getRangeBounds(anchor, focus)` (normalizes min/max row/col)
3. Iterates rows and visible cells, building tab-separated rows and newline-separated lines from `cell.getValue()`
4. Calls `setCopiedRange({ anchor, focus })` **synchronously** before the async clipboard write
5. Calls `navigator.clipboard.writeText(lines.join('\n'))`

A `performCopyRef` mirrors `performCopy` so the document-level `keydown` listener (registered in a `useEffect` with `[enableRangeSelection]` as the only dep) always calls the latest closure without re-registering on every render.

### When `copiedRange` clears

| Trigger                                  | Clears? | Why                                        |
| ---------------------------------------- | ------- | ------------------------------------------ |
| Paste (Ctrl/Cmd+V)                       | ✅      | Excel behavior                             |
| Escape (document keydown)                | ✅      | Excel behavior                             |
| Escape (keyboard nav keydown)            | ✅      | Same path; uses `clearRange()` + `setCopiedRange(null)` |
| Click on a cell (mousedown)              | ❌      | Ants persist so user can browse to paste   |
| Drag-select a new range                  | ❌      | Same — ants stay until paste or Escape     |
| Arrow / Tab navigation in active cell    | ❌      | Same                                      |

### Paste — `onCellEdit`

`handlePaste` ([DataTable.tsx:913](../../src/shared/components/organisms/DataTable/DataTable.tsx)) is registered on `document` only when both `enableRangeSelection` and `onCellEdit` are present. It:

1. Skips when focus is in `INPUT` / `TEXTAREA` / `SELECT` (editing a cell)
2. Reads `activeCellRef.current` for the paste origin
3. Splits clipboard text on `\n` (rows) and `\t` (cols)
4. For each value, calls `onCellEdit(targetRow.index, targetCell.column.id, value)`

**The consumer's `onCellEdit` is responsible for converting the pasted text to the column's underlying value.** For example, pasting `"Aktif"` into a boolean `isActive` column requires the consumer to convert `"Aktif" → true`. See [VendorItemCatalogList](../../src/domains/vendor-catalog/components/VendorItemCatalogList.tsx) for a concrete example.

---

## Keyboard Model

| Key                              | Action                                                       |
| -------------------------------- | ------------------------------------------------------------ |
| `Ctrl/Cmd+C`                     | Copy current range → clipboard + marching ants               |
| `Ctrl/Cmd+V`                     | Paste clipboard at active cell                               |
| `Escape`                         | Clear range + clear copied range + clear active cell         |
| `Arrow keys`                     | Move active cell, clear range                                |
| `Tab` / `Shift+Tab`              | Move active cell horizontally, clear range                   |
| `Enter` (when not editing)       | Start edit on active cell                                    |
| `F2`                             | Start edit on active cell                                    |
| `Enter` / `Tab` (when editing)   | Save edit + move to next cell                                |
| `Esc` (when editing)             | Cancel edit                                                  |

The `<section>` wrapper is `tabIndex={0}` when `enableRangeSelection` so it can receive keyboard focus. Cell mousedown calls `e.preventDefault()` to block text selection during drag, which also blocks the default focus shift — so the section mousedown handler explicitly calls `sectionRef.current?.focus({ preventScroll: true })` to keep keyboard events flowing.

---

## Context Menu Integration

The `contextMenu` prop receives a second `options` argument:

```ts
contextMenu?: (
  row: Row<TData>,
  options?: {
    activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
    rangeBounds?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
    rangeValues?: unknown[][];
    rangeRowIndices?: number[];
    triggerCopy?: () => void;
  }
) => ReactNode;
```

### ✅ Correct — use `triggerCopy` for range copy

```tsx
contextMenu={(row, { activeCellInfo, rangeBounds, rangeRowIndices, triggerCopy } = {}) => (
  <ContextMenuItem
    onClick={() => {
      if (rangeBounds && triggerCopy) {
        triggerCopy();                       // ← marching ants + clipboard text
      } else {
        const valueToCopy = activeCellInfo?.value ?? row.original.name ?? '';
        navigator.clipboard.writeText(String(valueToCopy)).catch(() => undefined);
      }
    }}
  >
    <Copy />
    Salin
  </ContextMenuItem>
)}
```

### ❌ Wrong — calling `navigator.clipboard.writeText` directly for a range

```tsx
// BUG: marching ants never appear, and the text format may differ from what performCopy produces
if (rangeBounds && rangeValues) {
  const text = rangeValues
    .map((r) => r.map((v) => String(v ?? '')).join('\t'))
    .join('\n');
  navigator.clipboard.writeText(text);
}
```

`triggerCopy` is the **only** path that sets `copiedRange` (and therefore the only path that triggers the marching-ants animation). Always call it for range copy, even if you don't need the marching-ants UX — the next paste from a non-marching-ants path is undefined behavior.

### Single-cell copy

Falls back to `activeCellInfo.value` (the column's accessor value) or `row.original.<something>`. For columns where the displayed text differs from the accessor value (e.g., a column with `accessorKey: 'itemCatalogId'` that renders `row.original.name`), the consumer is responsible for choosing which to copy. See [VendorItemCatalogList](../../src/domains/vendor-catalog/components/VendorItemCatalogList.tsx) for the pattern.

---

## Adding Excel Mode to a New List Page

1. Define columns with `meta.editable: true` + `meta.editType` on every column you want editable. **Paste silently no-ops on non-editable columns** because the consumer's `onCellEdit` ignores unknown columnIds, but the marching-ants state will still highlight them. To prevent non-editable cells from getting ants, the consumer should check the column's `meta.editable` in its `onCellEdit`.

2. Wire the page hook:

   ```ts
   const handleCellEdit = useCallback(
     (rowIndex: number, columnId: string, value: unknown) => {
       const target = rows[rowIndex];
       if (!target) return;
       // columnId-specific conversion goes here
     },
     [rows]
   );
   ```

3. Pass to the table:

   ```tsx
   <DataTable
     data={rows}
     columns={columns}
     enableRangeSelection
     onCellEdit={handleCellEdit}
     contextMenu={handleContextMenu}  // uses triggerCopy
   />
   ```

4. In the context menu, follow the **Correct** pattern above — `triggerCopy()` for ranges, single-cell fallback otherwise.

---

## Anti-Patterns

| ❌ Don't                                                   | ✅ Do                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Add `'use client'` to `app/<route>/page.tsx`              | Keep `page.tsx` as a Server Component                              |
| Use `border` (not `outline`) for the active cell           | Use `outline` with `-outline-offset-*` to avoid layout shift       |
| Call `navigator.clipboard.writeText` directly for ranges   | Call `triggerCopy()` from the context menu options                 |
| Read `rangeAnchor` / `rangeFocus` from state in key handlers | Read from refs (`rangeAnchorRef.current`) — refs are always current |
| Add `setCopiedRange(null)` in cell mousedown               | Leave it; ants persist across cell changes (Excel behavior)        |
| Change `border-separate border-spacing-0` to `border-collapse` | Keep `border-separate`; `border-collapse` breaks sticky header backgrounds |
| Use `hsl(var(--background))` in inline styles              | Use `var(--background)` directly — variables hold hex values, not HSL channels |
| Use `hsl(var(--muted) / .5)` for opacity                  | Use `color-mix(in srgb, var(--muted) 50%, transparent)`            |
| Skip the `performCopyRef` indirection                      | Use it; the document listener would re-register every render       |
| Re-introduce `setIsRangeSelecting(false)` on cell click   | The document-level `mouseup` listener handles it                  |
| Add a separate expand column for tree view                 | Use `treeColumnIndex` — the chevron is inlined in the first data column |
| Put `overflow-y-auto max-h-*` on an outer wrapper for sticky header | It must go on `[data-slot=table-container]` — the actual sticky scroll boundary |

---

## File Map

| File                                                                                  | What lives there                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [src/shared/components/organisms/DataTable/DataTable.tsx](../../src/shared/components/organisms/DataTable/DataTable.tsx) | All Excel-mode state, refs, effects, copy/paste logic |
| [src/shared/components/organisms/DataTable/DataTable.stories.tsx](../../src/shared/components/organisms/DataTable/DataTable.stories.tsx) | `ExcelMode` story — canonical reference for behavior  |
| [src/styles/globals.css](../../src/styles/globals.css)                                 | `@keyframes marching-ants`, `--animate-marching-ants`, `prefers-reduced-motion` guard |
| [src/domains/vendor-catalog/components/VendorItemCatalogList.tsx](../../src/domains/vendor-catalog/components/VendorItemCatalogList.tsx) | Real-world consumer using `triggerCopy`               |
