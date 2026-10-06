import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import type { ProjectType } from '../../types';
import { ProjectTypeForm } from '../ProjectTypeForm';

const mockProjectType: ProjectType = {
  id: '1',
  code: 'PT-001',
  name: 'Test Project Type',
  description: 'Test description',
  itemType: 'Material',
  itemCategory: 'Category A',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ProjectTypeForm Integration', () => {
  it('renders form fields in create mode', async () => {
    render(<ProjectTypeForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nama/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });
  });

  it('renders with default values in create mode', async () => {
    render(<ProjectTypeForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode/i)).toHaveValue('');
      expect(screen.getByLabelText(/Nama/i)).toHaveValue('');
    });
  });

  it('renders project type data in edit mode', async () => {
    render(<ProjectTypeForm mode="edit" projectType={mockProjectType} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode/i)).toHaveValue('PT-001');
      expect(screen.getByLabelText(/Nama/i)).toHaveValue('Test Project Type');
    });
  });

  it('calls onSubmit with correct payload on valid form submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ProjectTypeForm onSubmit={onSubmit} />);

    const codeInput = await screen.findByLabelText(/Kode/i);
    const nameInput = screen.getByLabelText(/Nama/i);

    await user.type(codeInput, 'PT-002');
    await user.type(nameInput, 'New Project Type');

    const saveButton = screen.getByRole('button', { name: /Simpan/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'PT-002',
          name: 'New Project Type',
          isActive: true,
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<ProjectTypeForm onCancel={onCancel} />);

    const cancelButton = await screen.findByRole('button', { name: /Batal/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('displays validation errors on submit with empty required fields', async () => {
    render(<ProjectTypeForm />);

    const form = document.getElementById('project-type-form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Kode wajib diisi/i)).toBeInTheDocument();
    });
  });
});
