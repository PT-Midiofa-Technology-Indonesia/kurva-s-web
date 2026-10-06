import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import type { HierarchyManagement } from '../../types';
import { HierarchyManagementForm } from '../HierarchyManagementForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('companyId=test-company-id'),
}));

const mockHierarchyManagement: HierarchyManagement = {
  id: '1',
  isActive: true,
  company: { id: 'c1', code: 'CMP-001', name: 'Test Company' },
  department: { id: 'd1', code: 'DEP-001', name: 'IT Department' },
  position: { id: 'p1', code: 'POS-001', name: 'Manager', level: 3, isActive: true },
  parent: null,
  children: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('HierarchyManagementForm Integration', () => {
  beforeEach(() => {
    useSelectedCompanyStore.setState({ selectedCompanyId: 'test-company-id' });
  });

  it('renders form fields in create mode', async () => {
    render(<HierarchyManagementForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Job Position/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Parent Position/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });
  });

  it('renders read-only position info fields', async () => {
    render(<HierarchyManagementForm />);

    await waitFor(() => {
      const readOnlyFields = screen.getAllByPlaceholderText(/Pilih job position terlebih dahulu/i);
      expect(readOnlyFields.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<HierarchyManagementForm onCancel={onCancel} />);

    const cancelButton = await screen.findByRole('button', { name: /Batal/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('displays validation errors on submit with empty required fields', async () => {
    render(<HierarchyManagementForm />);

    const form = document.getElementById('hierarchy-management-form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Department wajib diisi/i)).toBeInTheDocument();
    });
  });

  it('renders hierarchy management data in edit mode', async () => {
    render(<HierarchyManagementForm mode="edit" hierarchyManagement={mockHierarchyManagement} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Simpan Perubahan/i })).toBeInTheDocument();
    });
  });
});
