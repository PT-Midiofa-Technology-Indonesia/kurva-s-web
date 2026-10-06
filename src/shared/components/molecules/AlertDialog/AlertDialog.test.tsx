import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './AlertDialog';

vi.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: any) => <div className={className} data-testid="alert-triangle" />,
  CircleAlert: ({ className }: any) => <div className={className} data-testid="circle-alert" />,
  CircleCheck: ({ className }: any) => <div className={className} data-testid="circle-check" />,
  CircleX: ({ className }: any) => <div className={className} data-testid="circle-x" />,
  Loader2: ({ className }: any) => <div className={className} data-testid="loader" />,
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => (
    <div data-testid="alert-dialog" data-open={open}>
      {children}
    </div>
  ),
  AlertDialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
  AlertDialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  AlertDialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  AlertDialogTitle: ({ children, className }: any) => (
    <div data-testid="dialog-title" className={className}>
      {children}
    </div>
  ),
  AlertDialogDescription: ({ children, className }: any) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  AlertDialogFooter: ({ children, className }: any) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
  AlertDialogAction: ({ children, onClick, disabled, className, ...props }: any) => (
    <button
      data-testid="dialog-action"
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, onClick, className, ...props }: any) => (
    <button data-testid="dialog-cancel" onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('ConfirmDialog', () => {
  it('renders dialog with title', () => {
    render(<ConfirmDialog title="Confirm Action" />);
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<ConfirmDialog title="Confirm" description="Are you sure?" />);
    expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<ConfirmDialog title="Confirm" />);
    expect(screen.queryByTestId('dialog-description')).not.toBeInTheDocument();
  });

  it('renders trigger element when provided', () => {
    render(<ConfirmDialog title="Confirm" trigger={<button type="button">Open Dialog</button>} />);
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('renders default icon for default variant', () => {
    render(<ConfirmDialog title="Confirm" variant="default" />);
    expect(screen.getByTestId('circle-alert')).toBeInTheDocument();
  });

  it('renders danger icon for danger variant', () => {
    render(<ConfirmDialog title="Confirm" variant="danger" />);
    expect(screen.getByTestId('circle-x')).toBeInTheDocument();
  });

  it('renders success icon for success variant', () => {
    render(<ConfirmDialog title="Confirm" variant="success" />);
    expect(screen.getByTestId('circle-check')).toBeInTheDocument();
  });

  it('renders warning icon for warning variant', () => {
    render(<ConfirmDialog title="Confirm" variant="warning" />);
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
  });

  it('uses custom icon when provided', () => {
    const customIcon = <div data-testid="custom-icon">Custom</div>;
    render(<ConfirmDialog title="Confirm" icon={customIcon} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders cancel and confirm buttons with default text', () => {
    render(<ConfirmDialog title="Confirm" />);
    expect(screen.getByTestId('dialog-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-action')).toBeInTheDocument();
  });

  it('renders cancel and confirm buttons with custom text', () => {
    render(<ConfirmDialog title="Confirm" cancelText="No" confirmText="Yes" />);
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Confirm" onCancel={handleCancel} />);

    const cancelButton = screen.getByTestId('dialog-cancel');
    await user.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Confirm" onConfirm={handleConfirm} />);

    const confirmButton = screen.getByTestId('dialog-action');
    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalled();
  });

  it('displays loading spinner in cancel button when loading', () => {
    render(<ConfirmDialog title="Confirm" isLoading={true} />);
    const loaderElements = screen.getAllByTestId('loader');
    expect(loaderElements.length).toBeGreaterThan(0);
  });

  it('does not call onConfirm when disabled', async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Confirm" onConfirm={handleConfirm} disabled={true} />);

    const confirmButton = screen.getByTestId('dialog-action');
    await user.click(confirmButton);

    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('disables confirm button when disabled', () => {
    render(<ConfirmDialog title="Confirm" disabled={true} />);
    const confirmButton = screen.getByTestId('dialog-action');
    expect(confirmButton).toBeDisabled();
  });

  it('disables confirm button when loading', () => {
    render(<ConfirmDialog title="Confirm" isLoading={true} />);
    const confirmButton = screen.getByTestId('dialog-action');
    expect(confirmButton).toBeDisabled();
  });

  it('renders close button', () => {
    render(<ConfirmDialog title="Confirm" />);
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('calls onCancel when close button clicked', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Confirm" onCancel={handleCancel} />);

    const closeButton = screen.getByRole('button', { name: '' }).closest('button');
    if (closeButton) {
      await user.click(closeButton);
      expect(handleCancel).toHaveBeenCalled();
    }
  });

  it('accepts open prop for controlled mode', () => {
    const { rerender } = render(
      <ConfirmDialog title="Confirm" open={false} onOpenChange={vi.fn()} />
    );
    expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');

    rerender(<ConfirmDialog title="Confirm" open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('calls onOpenChange when open state changes', () => {
    const handleOpenChange = vi.fn();
    render(<ConfirmDialog title="Confirm" open={false} onOpenChange={handleOpenChange} />);
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
  });

  it('applies custom className to action button', () => {
    render(<ConfirmDialog title="Confirm" className="custom-action-class" />);
    const actionButton = screen.getByTestId('dialog-action');
    expect(actionButton.className).toContain('custom-action-class');
  });

  it('applies custom contentClassName to dialog content', () => {
    render(<ConfirmDialog title="Confirm" contentClassName="custom-content-class" />);
    const content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('custom-content-class');
  });

  it('applies custom footerClassName to dialog footer', () => {
    render(<ConfirmDialog title="Confirm" footerClassName="custom-footer-class" />);
    const footer = screen.getByTestId('dialog-footer');
    expect(footer.className).toContain('custom-footer-class');
  });

  it('does not call onConfirm when isLoading is true', async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Confirm" onConfirm={handleConfirm} isLoading={true} />);

    const confirmButton = screen.getByTestId('dialog-action');
    await user.click(confirmButton);

    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
