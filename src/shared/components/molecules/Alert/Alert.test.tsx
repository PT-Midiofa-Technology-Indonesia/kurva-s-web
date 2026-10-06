import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './Alert';

vi.mock('lucide-react', () => ({
  AlertCircle: ({ className }: any) => (
    <div className={className} data-testid="alert-circle-icon" />
  ),
  CheckCircle: ({ className }: any) => (
    <div className={className} data-testid="check-circle-icon" />
  ),
  Info: ({ className }: any) => <div className={className} data-testid="info-icon" />,
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Alert', () => {
  it('renders alert with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Default Alert</AlertTitle>
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders alert with children', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description text</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert description text')).toBeInTheDocument();
  });

  it('renders default variant with info icon', () => {
    render(
      <Alert variant="default">
        <AlertTitle>Info</AlertTitle>
      </Alert>
    );
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('renders destructive variant with alert icon', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
      </Alert>
    );
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
  });

  it('renders warning variant with info icon', () => {
    render(
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
      </Alert>
    );
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('renders success variant with check icon', () => {
    render(
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
      </Alert>
    );
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('does not show dismiss button when showDismiss is false', () => {
    render(
      <Alert showDismiss={false}>
        <AlertTitle>No dismiss</AlertTitle>
      </Alert>
    );
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('shows dismiss button when showDismiss is true', () => {
    render(
      <Alert showDismiss>
        <AlertTitle>With dismiss</AlertTitle>
      </Alert>
    );
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button clicked', async () => {
    const handleDismiss = vi.fn();
    const user = userEvent.setup();

    render(
      <Alert showDismiss onDismiss={handleDismiss}>
        <AlertTitle>Dismissible</AlertTitle>
      </Alert>
    );

    const dismissButton = screen.getByRole('alert').querySelector('button');
    await user.click(dismissButton!);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('accepts custom className', () => {
    render(
      <Alert className="custom-class">
        <AlertTitle>Custom</AlertTitle>
      </Alert>
    );
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <Alert ref={ref as any}>
        <AlertTitle>Ref test</AlertTitle>
      </Alert>
    );
    expect(ref.current).toBeTruthy();
  });
});

describe('AlertTitle', () => {
  it('renders as paragraph by default', () => {
    render(<AlertTitle>Title text</AlertTitle>);
    expect(screen.getByText('Title text').tagName).toBe('P');
  });

  it('renders as custom element when as prop provided', () => {
    render(<AlertTitle as="h2">Custom heading</AlertTitle>);
    expect(screen.getByText('Custom heading').tagName).toBe('H2');
  });

  it('accepts custom className', () => {
    const { container } = render(<AlertTitle className="custom-class">Title</AlertTitle>);
    expect(container.querySelector('p')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<AlertTitle ref={ref as any}>Title</AlertTitle>);
    expect(ref.current).toBeTruthy();
  });
});

describe('AlertDescription', () => {
  it('renders as div', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text').tagName).toBe('DIV');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <AlertDescription className="custom-class">Description</AlertDescription>
    );
    expect(container.querySelector('div')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<AlertDescription ref={ref as any}>Description</AlertDescription>);
    expect(ref.current).toBeTruthy();
  });
});
