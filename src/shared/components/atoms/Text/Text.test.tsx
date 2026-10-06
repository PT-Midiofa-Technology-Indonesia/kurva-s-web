import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Text } from './Text';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders as paragraph by default', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello').tagName).toBe('P');
  });

  it('renders as different element when as prop is provided', () => {
    render(<Text as="h1">Heading</Text>);
    expect(screen.getByText('Heading').tagName).toBe('H1');
  });

  it('renders as span when requested', () => {
    render(<Text as="span">Span text</Text>);
    expect(screen.getByText('Span text').tagName).toBe('SPAN');
  });

  it('renders as div when requested', () => {
    render(<Text as="div">Div text</Text>);
    expect(screen.getByText('Div text').tagName).toBe('DIV');
  });

  it('applies size classes', () => {
    const { container } = render(<Text size="lg">Large text</Text>);
    expect(container.firstChild).toHaveClass('text-lg');
  });

  it('applies different size variants', () => {
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl'] as const;
    sizes.forEach((size) => {
      const { container } = render(
        <Text size={size} key={size}>
          {size}
        </Text>
      );
      expect(container.firstChild).toHaveClass(`text-${size}`);
    });
  });

  it('applies weight classes', () => {
    const { container } = render(<Text weight="bold">Bold text</Text>);
    expect(container.firstChild).toHaveClass('font-bold');
  });

  it('applies different weight variants', () => {
    const weights = ['light', 'normal', 'medium', 'semibold', 'bold'] as const;
    weights.forEach((weight) => {
      const { container } = render(
        <Text weight={weight} key={weight}>
          {weight}
        </Text>
      );
      expect(container.firstChild).toHaveClass(`font-${weight}`);
    });
  });

  it('applies color classes', () => {
    const { container } = render(<Text color="destructive">Red text</Text>);
    expect(container.firstChild).toHaveClass('text-destructive');
  });

  it('applies different color variants', () => {
    const colors = ['foreground', 'muted-foreground', 'destructive', 'primary'] as const;
    colors.forEach((color) => {
      const { container } = render(
        <Text color={color} key={color}>
          {color}
        </Text>
      );
      const expectedClass = `text-${color}`;
      expect((container.firstChild as HTMLElement)?.className).toContain(expectedClass);
    });
  });

  it('combines size, weight, and color', () => {
    const { container } = render(
      <Text size="xl" weight="bold" color="primary">
        Combined
      </Text>
    );
    const element = container.firstChild as HTMLElement;
    expect(element?.className).toContain('text-xl');
    expect(element?.className).toContain('font-bold');
    expect(element?.className).toContain('text-primary');
  });

  it('applies custom className', () => {
    const { container } = render(<Text className="custom-class">Custom</Text>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('merges custom className with variant classes', () => {
    const { container } = render(
      <Text size="lg" className="custom-class">
        Merged
      </Text>
    );
    const element = container.firstChild as HTMLElement;
    expect(element?.className).toContain('text-lg');
    expect(element?.className).toContain('custom-class');
  });

  it('defaults to correct values', () => {
    const { container } = render(<Text>Default</Text>);
    const element = container.firstChild as HTMLElement;
    expect(element?.className).toContain('text-base'); // default size
    expect(element?.className).toContain('font-normal'); // default weight
    expect(element?.className).toContain('text-foreground'); // default color
  });

  it('accepts additional HTML attributes', () => {
    render(<Text data-testid="custom-text">Test</Text>);
    expect(screen.getByTestId('custom-text')).toBeInTheDocument();
  });

  it('accepts aria attributes', () => {
    render(<Text aria-label="aria-label-text">Content</Text>);
    expect(screen.getByLabelText('aria-label-text')).toBeInTheDocument();
  });
});
