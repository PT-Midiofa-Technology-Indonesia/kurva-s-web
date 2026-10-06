import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { FILE_TYPE_OPTIONS } from '../../constants';
import type { DocumentType } from '../../types';
import { DocumentTypeForm } from '../DocumentTypeForm';

const mockDocumentType: DocumentType = {
  id: '1',
  code: 'DOC-001',
  name: 'Kartu Tanda Penduduk',
  description: 'Dokumen identitas diri',
  allowedFileTypes: 'pdf,jpg,png',
  allowedFileSize: 2048,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function getFileTypeCheckbox(label: string) {
  return screen.getByText(label).closest('label')?.parentElement?.querySelector('button');
}

describe('DocumentTypeForm Integration', () => {
  it('renders form fields in create mode', async () => {
    render(<DocumentTypeForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nama/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Maks Ukuran File/i)).toBeInTheDocument();
      expect(screen.getByText(/Ekstensi File/i)).toBeInTheDocument();
    });
  });

  it('renders with default values in create mode', async () => {
    render(<DocumentTypeForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode/i)).toHaveValue('');
      expect(screen.getByLabelText(/Nama/i)).toHaveValue('');
    });
  });

  it('renders all 8 file type checkboxes', async () => {
    render(<DocumentTypeForm />);

    await waitFor(() => {
      FILE_TYPE_OPTIONS.forEach((opt) => {
        expect(getFileTypeCheckbox(opt.label)).toBeInTheDocument();
      });
    });
  });

  it('renders document type data in edit mode with file type checkboxes pre-filled', async () => {
    render(<DocumentTypeForm mode="edit" documentType={mockDocumentType} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode/i)).toHaveValue('DOC-001');
      expect(screen.getByLabelText(/Nama/i)).toHaveValue('Kartu Tanda Penduduk');
      expect(screen.getByLabelText(/Maks Ukuran File/i)).toHaveValue('2048');
      expect(getFileTypeCheckbox('.pdf')).toHaveAttribute('data-state', 'checked');
      expect(getFileTypeCheckbox('.jpg')).toHaveAttribute('data-state', 'checked');
      expect(getFileTypeCheckbox('.png')).toHaveAttribute('data-state', 'checked');
      expect(getFileTypeCheckbox('.doc')).toHaveAttribute('data-state', 'unchecked');
    });
  });

  it('calls onSubmit with correct payload on valid form submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<DocumentTypeForm onSubmit={onSubmit} />);

    const codeInput = await screen.findByLabelText(/Kode/i);
    const nameInput = screen.getByLabelText(/Nama/i);
    const fileSizeInput = screen.getByLabelText(/Maks Ukuran File/i);

    await user.type(codeInput, 'DOC-002');
    await user.type(nameInput, 'Dokumen Kontrak');
    await user.clear(fileSizeInput);
    await user.type(fileSizeInput, '4096');

    await user.click(getFileTypeCheckbox('.pdf')!);
    await user.click(getFileTypeCheckbox('.docx')!);

    const saveButton = screen.getByRole('button', { name: /Simpan/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'DOC-002',
          name: 'Dokumen Kontrak',
          allowedFileTypes: 'pdf,docx',
          allowedFileSize: 4096,
          isActive: true,
        })
      );
    });
  });

  it('submits an empty allowedFileTypes when no checkboxes are selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<DocumentTypeForm onSubmit={onSubmit} />);

    await user.type(await screen.findByLabelText(/Kode/i), 'DOC-003');
    await user.type(screen.getByLabelText(/Nama/i), 'Tanpa Lampiran');

    const saveButton = screen.getByRole('button', { name: /Simpan/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'DOC-003',
          allowedFileTypes: undefined,
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<DocumentTypeForm onCancel={onCancel} />);

    const cancelButton = await screen.findByRole('button', { name: /Batal/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('displays validation errors on submit with empty required fields', async () => {
    render(<DocumentTypeForm />);

    const form = document.getElementById('document-type-form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Kode wajib diisi/i)).toBeInTheDocument();
    });
  });

  it('disables save button while submitting', async () => {
    render(<DocumentTypeForm isSubmitting />);

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /Menyimpan|Simpan/i });
      expect(saveButton).toBeDisabled();
    });
  });
});
