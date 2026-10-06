import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomToast } from './CustomToast/CustomToast';

describe('CustomToast', () => {
  it('renders title for success variant', () => {
    render(<CustomToast variant="success" title="Upload berhasil" />);
    expect(screen.getByText('Upload berhasil')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <CustomToast variant="success" title="Upload berhasil" description="File berhasil diupload" />
    );
    expect(screen.getByText('File berhasil diupload')).toBeInTheDocument();
  });

  it('renders progress bar and percentage label for progress variant', () => {
    render(<CustomToast variant="progress" title="Sedang mengupload file" percent={74} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('74%')).toBeInTheDocument();
  });

  it('does not render description when variant is progress', () => {
    render(
      <CustomToast
        variant="progress"
        title="Uploading"
        description="should not appear"
        percent={50}
      />
    );
    expect(screen.queryByText('should not appear')).not.toBeInTheDocument();
  });

  it('renders dismiss button and calls onDismiss when clicked', async () => {
    const onDismiss = vi.fn();
    render(<CustomToast variant="error" title="Upload gagal" onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<CustomToast variant="success" title="Success" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render description for progress variant when percent is undefined', () => {
    render(<CustomToast variant="progress" title="Uploading" description="should not appear" />);
    expect(screen.queryByText('should not appear')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
