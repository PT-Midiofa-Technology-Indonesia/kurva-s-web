import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import type { Group } from '../../types';
import { GroupForm } from '../GroupForm';

const mockGroup: Group = {
  id: '1',
  code: 'GRP-001',
  name: 'Test Group',
  description: 'Test description',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('GroupForm Integration', () => {
  it('renders form fields with group data', async () => {
    render(<GroupForm group={mockGroup} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode/i)).toHaveValue('GRP-001');
      expect(screen.getByLabelText(/Nama/i)).toHaveValue('Test Group');
    });
  });

  it('calls onSubmit with correct payload on valid form submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<GroupForm group={mockGroup} onSubmit={onSubmit} />);

    const saveButton = screen.getByRole('button', { name: /Simpan/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'GRP-001',
          name: 'Test Group',
          isActive: true,
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<GroupForm group={mockGroup} onCancel={onCancel} />);

    const cancelButton = await screen.findByRole('button', { name: /Batal/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('displays validation errors on submit with empty required fields', async () => {
    const emptyGroup: Group = { ...mockGroup, code: '', name: '' };
    render(<GroupForm group={emptyGroup} />);

    const form = document.getElementById('group-form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Kode wajib diisi/i)).toBeInTheDocument();
    });
  });
});
