import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileInput } from './FileInput';

vi.mock('lucide-react', () => ({
  FileText: ({ className }: any) => <div className={className} data-testid="file-text-icon" />,
  Image: ({ className }: any) => <div className={className} data-testid="image-icon" />,
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
  ExternalLink: ({ className }: any) => (
    <div className={className} data-testid="external-link-icon" />
  ),
}));

vi.mock('@/components/atoms', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('FileInput', () => {
  it('renders drag and drop area with empty state', () => {
    render(<FileInput />);
    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
  });

  it('displays file format and size limits', () => {
    render(<FileInput maxFiles={5} maxSize={10 * 1024 * 1024} />);
    expect(screen.getByText(/max 5 files/)).toBeInTheDocument();
  });

  it('renders browse button in empty state', () => {
    render(<FileInput />);
    const browseButton = screen.getByText('Browse files');
    expect(browseButton).toBeInTheDocument();
  });

  it('opens file input on browse button click', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileInput />);
    const browseButton = screen.getByText('Browse files');
    const hiddenInput = container.querySelector('input[type="file"]');

    const clickSpy = vi.spyOn(hiddenInput as HTMLElement, 'click');
    await user.click(browseButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('renders file input element', () => {
    const { container } = render(<FileInput onChange={vi.fn()} />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('displays max size in format', async () => {
    render(<FileInput maxSize={5 * 1024 * 1024} />);
    // Verify 5MB is displayed in the format text
    expect(screen.getByText(/5MB/)).toBeInTheDocument();
  });

  it('displays max files limit in text', () => {
    render(<FileInput maxFiles={2} />);
    expect(screen.getByText(/max 2 files/)).toBeInTheDocument();
  });

  it('displays selected files with file list', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    render(<FileInput value={[file]} onChange={vi.fn()} />);
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('removes file when remove button clicked', async () => {
    const handleChange = vi.fn();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    render(<FileInput onChange={handleChange} value={[file]} />);

    const removeButton = screen.getByLabelText(/Remove test.txt/);
    await userEvent.click(removeButton);

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('shows add more button when files added but below max', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    render(<FileInput maxFiles={5} value={[file]} />);
    expect(screen.getByText('Add More')).toBeInTheDocument();
  });

  it('hides add more button when max files reached', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    render(<FileInput maxFiles={1} value={[file]} />);
    expect(screen.queryByText('Add More')).not.toBeInTheDocument();
  });

  it('disables file input when disabled prop is true', () => {
    const { container } = render(<FileInput disabled />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeDisabled();
  });

  it('disables browse button when disabled', () => {
    render(<FileInput disabled />);
    const browseButton = screen.getByText('Browse files');
    expect(browseButton).toBeDisabled();
  });

  it('displays error from error prop', () => {
    render(<FileInput error="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('shows correct file icon for images', () => {
    const imageFile = new File(['content'], 'image.png', { type: 'image/png' });
    render(<FileInput value={[imageFile]} onChange={vi.fn()} />);
    expect(screen.getByAltText('image.png')).toBeInTheDocument();
  });

  it('shows correct file icon for pdf', () => {
    const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    render(<FileInput value={[pdfFile]} onChange={vi.fn()} />);
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
  });

  it('formats file size correctly', () => {
    const file = new File(['a'.repeat(2048)], 'large.txt', { type: 'text/plain' });
    render(<FileInput value={[file]} onChange={vi.fn()} />);
    const sizeText = screen.getByText(/2 KB/);
    expect(sizeText).toBeInTheDocument();
  });

  it('accepts custom accept attribute', () => {
    const { container } = render(<FileInput accept=".pdf,.doc,.docx" />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe('.pdf,.doc,.docx');
  });

  it('renders drag and drop area with aria-label', () => {
    const { container } = render(<FileInput />);
    const dragArea = container.querySelector('section[aria-label="File upload area"]');
    expect(dragArea).toBeInTheDocument();
  });
});
