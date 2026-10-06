import { describe, expect, it, vi } from 'vitest';
import { useGroup } from '@/domains/group/hooks/use-group';
import { fireEvent, render, screen } from '@/utils/test-utils';
import type { Group } from '../../types';
import { GroupDetailDrawer } from '../GroupDetailDrawer';

vi.mock('@/domains/group/hooks/use-group', () => ({
  useGroup: vi.fn(),
}));

const mockGroup: Group = {
  id: '1',
  code: 'GRP-001',
  name: 'Test Group',
  description: 'Test description',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockUseGroup = vi.mocked(useGroup);

describe('GroupDetailDrawer Integration', () => {
  it('renders nothing when open is false', () => {
    mockUseGroup.mockReturnValue({ data: null, isLoading: false } as ReturnType<typeof useGroup>);
    render(<GroupDetailDrawer open={false} onClose={() => {}} id={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders group data when open is true', () => {
    mockUseGroup.mockReturnValue({ data: mockGroup, isLoading: false } as ReturnType<
      typeof useGroup
    >);
    render(<GroupDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Detail Group')).toBeInTheDocument();
    expect(screen.getByText('GRP-001')).toBeInTheDocument();
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows active status by default', () => {
    mockUseGroup.mockReturnValue({ data: mockGroup, isLoading: false } as ReturnType<
      typeof useGroup
    >);
    render(<GroupDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('shows inactive status when group is inactive', () => {
    mockUseGroup.mockReturnValue({
      data: { ...mockGroup, isActive: false },
      isLoading: false,
    } as ReturnType<typeof useGroup>);
    render(<GroupDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
  });

  it('opens confirm dialog when status switch is toggled', () => {
    mockUseGroup.mockReturnValue({ data: mockGroup, isLoading: false } as ReturnType<
      typeof useGroup
    >);
    render(<GroupDetailDrawer open={true} onClose={() => {}} id="1" />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(screen.getByText('Ubah Status?')).toBeInTheDocument();
  });

  it('closes confirm dialog on cancel', () => {
    mockUseGroup.mockReturnValue({ data: mockGroup, isLoading: false } as ReturnType<
      typeof useGroup
    >);
    render(<GroupDetailDrawer open={true} onClose={() => {}} id="1" />);

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
    mockUseGroup.mockReturnValue({ data: mockGroup, isLoading: false } as ReturnType<
      typeof useGroup
    >);
    render(<GroupDetailDrawer open={true} onClose={onClose} id="1" />);

    const closeButton = document.querySelector('[data-slot="drawer-close"]')!;
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    mockUseGroup.mockReturnValue({ data: mockGroup, isLoading: false } as ReturnType<
      typeof useGroup
    >);
    render(<GroupDetailDrawer open={true} onClose={() => {}} onEdit={onEdit} id="1" />);

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders fallback values when group fields are null', () => {
    mockUseGroup.mockReturnValue({
      data: {
        ...mockGroup,
        description: null,
        code: '',
        name: '',
      },
      isLoading: false,
    } as ReturnType<typeof useGroup>);
    render(<GroupDetailDrawer open={true} onClose={() => {}} id="1" />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
