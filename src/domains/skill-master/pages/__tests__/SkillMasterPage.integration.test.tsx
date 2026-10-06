import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { SKILL_LEVEL_LABELS, SKILL_MASTER_TAB_LABELS, SKILL_MASTER_TABS } from '../../constants';
import { SkillMasterPage } from '../SkillMasterPage';

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => '/master-data/skill-master',
  useSearchParams: () => mockSearchParams,
}));

describe('SkillMasterPage Integration', () => {
  afterEach(() => {
    mockReplace.mockClear();
    mockSearchParams.forEach((_, key) => {
      mockSearchParams.delete(key);
    });
  });

  it('renders all 3 tab buttons when user has all permissions', async () => {
    render(<SkillMasterPage />);

    expect(
      await screen.findByRole('button', {
        name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL_LEVEL],
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL_CATEGORY],
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL],
      })
    ).toBeInTheDocument();
  });

  it('renders only permitted tabs when user has restricted permissions', async () => {
    server.use(
      http.get('/api/v1/auth/me', () => {
        return HttpResponse.json({
          success: true,
          message: 'User retrieved successfully',
          data: {
            id: '1',
            name: 'Restricted User',
            email: 'user@example.com',
            permissions: ['md.sm.sctg'],
          },
        });
      })
    );

    render(<SkillMasterPage />);

    expect(
      await screen.findByRole('button', {
        name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL_CATEGORY],
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL_LEVEL],
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL],
      })
    ).not.toBeInTheDocument();
  });

  it('mounts SkillLevelListContent by default', async () => {
    render(<SkillMasterPage />);
    expect(
      await screen.findByRole('heading', { name: SKILL_LEVEL_LABELS.LIST.TITLE })
    ).toBeInTheDocument();
  });

  it('calls router.replace with tab=skill-category when switching to Skill Category', async () => {
    const user = userEvent.setup();
    render(<SkillMasterPage />);

    const categoryButton = await screen.findByRole('button', {
      name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL_CATEGORY],
    });
    await user.click(categoryButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${SKILL_MASTER_TABS.SKILL_CATEGORY}`),
        { scroll: false }
      );
    });
  });

  it('calls router.replace with tab=skill when switching to Skill Catalog', async () => {
    const user = userEvent.setup();
    render(<SkillMasterPage />);

    const catalogButton = await screen.findByRole('button', {
      name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL],
    });
    await user.click(catalogButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${SKILL_MASTER_TABS.SKILL}`),
        { scroll: false }
      );
    });
  });

  it('does not include tab param in URL when switching back to Skill Level', async () => {
    const user = userEvent.setup();
    render(<SkillMasterPage />);

    const levelButton = await screen.findByRole('button', {
      name: SKILL_MASTER_TAB_LABELS[SKILL_MASTER_TABS.SKILL_LEVEL],
    });
    await user.click(levelButton);

    await waitFor(() => {
      const lastCall = mockReplace.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).not.toContain('tab=');
    });
  });
});
