import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageHeader } from './PageHeader';

vi.mock('lucide-react', () => ({
  ArrowLeft: ({ className }: any) => <div className={className} data-testid="arrow-left" />,
}));

vi.mock('@/shared/components/atoms', () => ({
  Button: ({ children, onClick, className, variant, ...props }: any) => (
    <button className={className} data-variant={variant} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('PageHeader', () => {
  it('renders title', () => {
    const handleBack = vi.fn();
    render(<PageHeader title="Page Title" onBack={handleBack} />);
    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });

  it('renders back button', () => {
    const handleBack = vi.fn();
    render(<PageHeader title="Page Title" onBack={handleBack} />);
    expect(screen.getByTestId('arrow-left').closest('button')).toBeInTheDocument();
  });

  it('calls onBack when back button clicked', async () => {
    const handleBack = vi.fn();
    const user = userEvent.setup();

    render(<PageHeader title="Page Title" onBack={handleBack} />);

    const backButton = screen.getByTestId('arrow-left').closest('button')!;
    await user.click(backButton);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('renders back button with arrow icon', () => {
    const handleBack = vi.fn();
    render(<PageHeader title="Page Title" onBack={handleBack} />);
    expect(screen.getByTestId('arrow-left')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    const handleBack = vi.fn();
    render(
      <PageHeader
        title="Page Title"
        onBack={handleBack}
        actions={
          <button type="button" data-testid="custom-action">
            Custom Action
          </button>
        }
      />
    );
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });

  it('does not render actions when not provided', () => {
    const handleBack = vi.fn();
    render(<PageHeader title="Page Title" onBack={handleBack} />);
    expect(screen.queryByTestId('custom-action')).not.toBeInTheDocument();
  });

  it('renders back button with outline variant', () => {
    const handleBack = vi.fn();
    const { container } = render(<PageHeader title="Page Title" onBack={handleBack} />);
    const backButton = container.querySelector('button');
    expect(backButton).toHaveAttribute('data-variant', 'outline');
  });
});
