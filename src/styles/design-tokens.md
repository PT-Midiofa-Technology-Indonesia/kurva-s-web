# Design Tokens - Curva S UI Design System

Reference for semantic colors and typography from the Figma design system.

## Color Palette

### Semantic Colors (Context-Aware)
Use these for semantic meaning rather than appearance.

```tsx
<button className="bg-primary text-primary-foreground">Primary Button</button>
<button className="bg-secondary text-secondary-foreground">Secondary</button>
<button className="bg-destructive text-destructive-foreground">Delete</button>
<button className="bg-accent text-accent-foreground">Accent</button>
```

- **Primary**: Brand color (Indigo) - Main actions
- **Secondary**: Neutral color (Slate) - Secondary actions
- **Destructive**: Red - Dangerous actions
- **Accent**: Brand color - Highlights
- **Muted**: Gray - Disabled, subtle states
- **Foreground**: Text color for contrast

### Color Palettes

#### Slate (Neutral)
For backgrounds, text, borders, and neutral UI elements.
```css
slate-50 #F8FAFC    slate-500 #64748B
slate-100 #F1F5F9   slate-600 #475569
slate-200 #E2E8F0   slate-700 #334155
slate-300 #CBD5E1   slate-800 #1E293B
slate-400 #94A3B8   slate-900 #0F172A
                     slate-950 #020617
```

#### Brand (Indigo)
Primary brand color for interactive elements.
```css
brand-50 #EEF2FF    brand-500 #6366F1
brand-100 #E0E7FF   brand-600 #4F46E5
brand-200 #C7D2FE   brand-700 #4338CA
brand-300 #A5B4FC   brand-800 #3730A3
brand-400 #818CF8   brand-900 #312E81
```

#### Error/Destructive (Red)
For errors, alerts, and destructive actions.
```css
error-50 #FEF2F2    error-500 #EF4444
error-100 #FEE2E2   error-600 #DC2626
error-200 #FECACA   error-700 #B91C1C
error-300 #FCA5A5   error-800 #991B1B
error-400 #F87171   error-900 #7F1D1D
```

#### Warning (Amber)
For warnings and attention-requiring states.
```css
warning-50 #FFFBEB   warning-500 #F59E0B
warning-100 #FEF3C7  warning-600 #D97706
warning-200 #FDE68A  warning-700 #B45309
warning-300 #FCD34D  warning-800 #92400E
warning-400 #FBBF24  warning-900 #78350F
```

#### Base
Absolute white and black.
```css
black #000000
white #FFFFFF
```

## Typography

Font: **Geist** (system-ui fallback)

### Font Sizes & Line Heights

```
xs     12px  line-height: 16px   → text-xs
sm     14px  line-height: 20px   → text-sm
base   16px  line-height: 24px   → text-base
lg     18px  line-height: 24px   → text-lg
xl     20px  line-height: 28px   → text-xl
2xl    24px  line-height: 32px   → text-2xl
3xl    30px  line-height: 36px   → text-3xl
4xl    36px  line-height: 40px   → text-4xl
5xl    48px  line-height: 52px   → text-5xl
6xl    60px  line-height: 64px   → text-6xl
7xl    72px  line-height: 80px   → text-7xl
8xl    96px  line-height: 104px  → text-8xl
9xl    128px line-height: 140px  → text-9xl
```

### Font Weights

```
light       300 → font-light
normal      400 → font-normal
medium      500 → font-medium
semibold    600 → font-semibold
bold        700 → font-bold
```

### Typography Classes

Combine size and weight using Tailwind classes:

```tsx
// Size classes
<h1 className="text-4xl font-bold">Large Heading</h1>
<h2 className="text-3xl font-semibold">Medium Heading</h2>
<p className="text-base font-normal">Body text</p>
<span className="text-sm font-light">Fine print</span>

// Semantic HTML
<h1>Automatically 4xl bold</h1>
<p>Automatically base normal</p>
<small>Automatically sm normal</small>
```

### Prebuilt Typography Styles

Use semantic HTML tags that auto-apply typography:

```tsx
<h1>9xl Bold</h1>
<h2>8xl Bold</h2>
<h3>7xl Bold</h3>
<h4>6xl Bold</h4>
<h5>5xl Bold</h5>
<h6>4xl Bold</h6>
<p>base Normal</p>
<small>sm Normal</small>
```

## Usage Examples

### Buttons
```tsx
// Primary (Brand color)
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-brand-600">
  Primary Button
</button>

// Secondary (Neutral)
<button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-slate-700">
  Secondary Button
</button>

// Destructive (Red)
<button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-error-600">
  Delete
</button>
```

### Text
```tsx
// Heading
<h1 className="text-4xl font-bold text-foreground">Page Title</h1>

// Body
<p className="text-base font-normal text-foreground">Regular paragraph text.</p>

// Muted/Disabled
<span className="text-muted-foreground">Disabled or hint text</span>

// Error
<span className="text-error-600">Error message</span>

// Warning
<span className="text-warning-600">Warning message</span>
```

### Cards & Containers
```tsx
<div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
  <h2 className="text-2xl font-bold mb-4">Card Title</h2>
  <p className="text-base text-foreground">Card content</p>
</div>
```

## Dark Mode

Colors automatically adapt in dark mode. No additional classes needed - use the same color names.

```tsx
// Same for light and dark mode
<div className="bg-background text-foreground">Content</div>
```

## CSS Variables

All tokens are available as CSS variables for custom styling:

```css
.custom-component {
  color: hsl(var(--foreground));
  background: hsl(var(--brand-500));
  border: 1px solid hsl(var(--slate-200));
}
```

## Guidelines

1. **Semantic Over Raw Colors**: Use `primary`, `secondary`, `destructive` instead of color names
2. **Contrast**: Ensure 4.5:1 contrast ratio for text
3. **Consistent Typography**: Use the predefined sizes, don't create custom ones
4. **Dark Mode**: Test components in both light and dark modes
5. **Font Family**: Always use Geist font via Tailwind utilities

## Responsive Usage

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Responsive Heading
</h1>

<button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground">
  Responsive Button
</button>
```
