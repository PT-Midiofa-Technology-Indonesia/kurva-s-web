# Styles

Global styles and CSS configurations.

## Structure

```
styles/
└── globals.css              # Global styles & design tokens
```

## Design Tokens (globals.css)

### Color Palettes

| Palette | Shades |
|---------|--------|
| **Brand** (Indigo) | 50-950: #eef2ff to #1e1b4b |
| **Slate** | 50-950: #f8fafc to #020617 |
| **Destructive** (Red) | 50-950: #fef2f2 to #450a0a |
| **Amber** | 50-950: #fffbeb to #451a03 |

### Semantic Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--background` | #ffffff | #0f172a |
| `--foreground` | #0f172a | #ffffff |
| `--primary` | #6366f1 | #6366f1 |
| `--secondary` | #f1f5f9 | #cbd5e1 |
| `--muted` | #e2e8f0 | #475569 |
| `--destructive` | #ef4444 | #ef4444 |
| `--border` | #e2e8f0 | #475569 |

### Typography

- **Font**: Geist (Inter + JetBrains Mono)
- **Sizes**: 13 levels (xs to 9xl)
- **Weights**: light, normal, medium, semibold, bold
- **Line Height**: 1.4-1.5

### Border Radius

- Default: 10px (rounded-lg)
- Small: 4px (rounded)
- Large: 16px

## Usage

```tsx
// Use design tokens in components
<div className="bg-primary text-primary-foreground">
  Content
</div>

// Custom colors from palette
<div className="bg-brand-500 text-white" />
<div className="bg-amber-50 border-amber-900" />
```

## Dark Mode

Add `dark` class to root element:
```tsx
<html className="dark">
  {/* Components automatically adapt */}
</html>
```