import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import { useSkillCatalog } from '../../hooks/use-skill-catalog';
import { useUpdateSkillCatalog } from '../../hooks/use-update-skill-catalog';
import type { SkillCatalog } from '../../types';
import { SkillCatalogDetailDrawer } from '../SkillCatalogDetailDrawer';

vi.mock('../../hooks/use-skill-catalog', () => ({ useSkillCatalog: vi.fn() }));
vi.mock('../../hooks/use-update-skill-catalog', () => ({ useUpdateSkillCatalog: vi.fn() }));

const mockSkillCatalog: SkillCatalog = {
  id: '1',
  groupId: null,
  group: null,
  skillCategoryId: 'cat-1',
  skillCategory: { id: 'cat-1', name: 'Programming' },
  skillLevelId: 'level-1',
  skillLevel: { id: 'level-1', name: 'Advanced' },
  code: 'SC-001',
  name: 'React Development',
  description: 'Advanced React development skills',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function setupMocks(item: SkillCatalog | null = mockSkillCatalog) {
  vi.mocked(useSkillCatalog).mockReturnValue({
    data: item ? { data: item } : null,
    isLoading: false,
  } as ReturnType<typeof useSkillCatalog>);
  vi.mocked(useUpdateSkillCatalog).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateSkillCatalog>);
}

describe('SkillCatalogDetailDrawer Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders nothing when open is false', () => {
    render(<SkillCatalogDetailDrawer open={false} onClose={() => {}} id={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders skill catalog data when open is true', () => {
    render(<SkillCatalogDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Detail Skill Catalog')).toBeInTheDocument();
    expect(screen.getByText('SC-001')).toBeInTheDocument();
    expect(screen.getByText('React Development')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Advanced React development skills')).toBeInTheDocument();
  });

  it('shows active status by default', () => {
    render(<SkillCatalogDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('opens confirm dialog when status switch is toggled', () => {
    render(<SkillCatalogDetailDrawer open={true} onClose={() => {}} id="1" />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(screen.getByText('Ubah Status?')).toBeInTheDocument();
  });

  it('closes confirm dialog on cancel', () => {
    render(<SkillCatalogDetailDrawer open={true} onClose={() => {}} id="1" />);

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
    render(<SkillCatalogDetailDrawer open={true} onClose={onClose} id="1" />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
