import { describe, expect, it, vi } from 'vitest';
import { useHierarchyManagement } from '@/domains/hierarchy-management/hooks/use-hierarchy-management';
import { fireEvent, render, screen } from '@/utils/test-utils';
import type { HierarchyManagement } from '../../types';
import { HierarchyManagementDetailDrawer } from '../HierarchyManagementDetailDrawer';

vi.mock('@/domains/hierarchy-management/hooks/use-hierarchy-management', () => ({
  useHierarchyManagement: vi.fn(),
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

const mockUseHierarchyManagement = vi.mocked(useHierarchyManagement);

describe('HierarchyManagementDetailDrawer Integration', () => {
  it('renders nothing when open is false', () => {
    mockUseHierarchyManagement.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={false} onClose={() => {}} id={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders hierarchy management data when open is true', () => {
    mockUseHierarchyManagement.mockReturnValue({
      data: mockHierarchyManagement,
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Detail Hierarchy')).toBeInTheDocument();
    expect(screen.getByText('POS-001')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('IT Department')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows active status by default', () => {
    mockUseHierarchyManagement.mockReturnValue({
      data: mockHierarchyManagement,
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('shows inactive status when hierarchy is inactive', () => {
    mockUseHierarchyManagement.mockReturnValue({
      data: { ...mockHierarchyManagement, isActive: false },
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
  });

  it('opens confirm dialog when status switch is toggled', () => {
    mockUseHierarchyManagement.mockReturnValue({
      data: mockHierarchyManagement,
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={true} onClose={() => {}} id="1" />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(screen.getByText('Ubah Status?')).toBeInTheDocument();
  });

  it('closes confirm dialog on cancel', () => {
    mockUseHierarchyManagement.mockReturnValue({
      data: mockHierarchyManagement,
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={true} onClose={() => {}} id="1" />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(screen.getByText('Ubah Status?')).toBeInTheDocument();

    const cancelButton = screen
      .getAllByText('Batal')
      .find((btn) => btn.getAttribute('data-slot') === 'alert-dialog-cancel');
    fireEvent.click(cancelButton!);

    expect(screen.queryByText('Ubah Status?')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    mockUseHierarchyManagement.mockReturnValue({
      data: mockHierarchyManagement,
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={true} onClose={onClose} id="1" />);

    const closeButton = document.querySelector('[data-slot="drawer-close"]')!;
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    mockUseHierarchyManagement.mockReturnValue({
      data: mockHierarchyManagement,
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(
      <HierarchyManagementDetailDrawer open={true} onClose={() => {}} onEdit={onEdit} id="1" />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders fallback values when optional fields are absent', () => {
    mockUseHierarchyManagement.mockReturnValue({
      data: {
        ...mockHierarchyManagement,
        parent: null,
      },
      isLoading: false,
    } as ReturnType<typeof useHierarchyManagement>);
    render(<HierarchyManagementDetailDrawer open={true} onClose={() => {}} id="1" />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
