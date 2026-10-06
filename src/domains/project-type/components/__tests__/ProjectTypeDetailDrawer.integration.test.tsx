import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { useProjectType } from '../../hooks/use-project-type';
import type { ProjectType } from '../../types';
import { ProjectTypeDetailDrawer } from '../ProjectTypeDetailDrawer';

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

vi.mock('../../hooks/use-project-type', () => ({
  useProjectType: vi.fn(),
}));

vi.mock('../../hooks/use-update-project-type', () => ({
  useUpdateProjectType: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

function setupMocks(data: ProjectType | null = mockProjectType) {
  vi.mocked(useProjectType).mockReturnValue({
    data,
    isLoading: false,
  } as ReturnType<typeof useProjectType>);
}

describe('ProjectTypeDetailDrawer Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders nothing when open is false', () => {
    render(<ProjectTypeDetailDrawer open={false} onClose={() => {}} id={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders project type data when open is true', async () => {
    render(<ProjectTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByText('Detail Project')).toBeInTheDocument();
      expect(screen.getByText('PT-001')).toBeInTheDocument();
      expect(screen.getByText('Test Project Type')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('shows active status by default', async () => {
    render(<ProjectTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByText('Aktif')).toBeInTheDocument();
    });
  });

  it('shows inactive status when project type is inactive', async () => {
    vi.mocked(useProjectType).mockReturnValue({
      data: { ...mockProjectType, isActive: false },
      isLoading: false,
    } as ReturnType<typeof useProjectType>);

    render(<ProjectTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
    });
  });

  it('opens confirm dialog when status switch is toggled', async () => {
    render(<ProjectTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(screen.getByText('Ubah Status?')).toBeInTheDocument();
  });

  it('closes confirm dialog on cancel', async () => {
    render(<ProjectTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(screen.getByText('Ubah Status?')).toBeInTheDocument();

    const cancelButton = screen
      .getAllByText('Batal')
      .find((btn) => btn.getAttribute('data-slot') === 'alert-dialog-cancel');
    fireEvent.click(cancelButton!);

    expect(screen.queryByText('Ubah Status?')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<ProjectTypeDetailDrawer open={true} onClose={onClose} id="1" />);

    await waitFor(() => {
      expect(document.querySelector('[data-slot="drawer-close"]')).toBeInTheDocument();
    });

    const closeButton = document.querySelector('[data-slot="drawer-close"]')!;
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<ProjectTypeDetailDrawer open={true} onClose={() => {}} onEdit={onEdit} id="1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders fallback values when project type fields are null', async () => {
    vi.mocked(useProjectType).mockReturnValue({
      data: {
        ...mockProjectType,
        description: null,
        code: '',
        name: '',
      },
      isLoading: false,
    } as ReturnType<typeof useProjectType>);

    render(<ProjectTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });
});
