import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { SKILL_LEVEL_LABELS } from '../../constants';
import { SkillLevelListContent } from '../SkillLevelListContent';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/skill-master',
  useSearchParams: () => new URLSearchParams(),
}));

describe('SkillLevelListPage Integration', () => {
  it('renders without crashing', async () => {
    render(<SkillLevelListContent />);
    expect(await screen.findByText(SKILL_LEVEL_LABELS.LIST.TITLE)).toBeInTheDocument();
  });

  it('displays page title', async () => {
    render(<SkillLevelListContent />);

    await waitFor(() => {
      expect(screen.getByText('Skill Level')).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    render(<SkillLevelListContent />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<SkillLevelListContent />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'test');

    await waitFor(() => {
      expect(searchInput).toHaveValue('test');
    });
  });

  it('displays status filter', async () => {
    render(<SkillLevelListContent />);

    await waitFor(() => {
      expect(screen.getByText('Semua Status')).toBeInTheDocument();
    });
  });
});
