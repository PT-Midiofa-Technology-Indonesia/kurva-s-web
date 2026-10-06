import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  BOQ_MANAGEMENT_TAB_LABELS,
  BOQ_MANAGEMENT_TABS,
} from '@/domains/project-control/constants';
import { BOQManagementPage } from '@/domains/project-control/pages/BOQManagementPage';
import { render, screen, waitFor } from '@/shared/utils/test-utils';

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => '/project-control/boq-management',
  useSearchParams: () => mockSearchParams,
}));

describe('BOQManagementPage Integration', () => {
  afterEach(() => {
    mockReplace.mockClear();
    mockSearchParams.forEach((_, key) => {
      mockSearchParams.delete(key);
    });
  });

  it('renders all 4 tab buttons', () => {
    render(<BOQManagementPage />);

    expect(
      screen.getByRole('button', { name: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.TEMPLATE] })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.PLANNING] })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.FINAL] })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.EXECUTION] })
    ).toBeInTheDocument();
  });

  it('mounts Template tab by default', async () => {
    render(<BOQManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByText('BoQ Template').length).toBeGreaterThan(0);
    });
  });

  it('mounts Planning tab when route tab=planning', async () => {
    mockSearchParams.set('tab', 'planning');
    render(<BOQManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByText('BoQ Planning').length).toBeGreaterThan(0);
    });
  });

  it('mounts Final tab when route tab=final', async () => {
    mockSearchParams.set('tab', 'final');
    render(<BOQManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByText('BoQ Final').length).toBeGreaterThan(0);
    });
  });

  it('mounts Execution tab when route tab=execution', async () => {
    mockSearchParams.set('tab', 'execution');
    render(<BOQManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByText('BoQ Execution').length).toBeGreaterThan(0);
    });
  });

  it('calls router.replace with tab=planning when switching to Planning', async () => {
    const user = userEvent.setup();
    render(<BOQManagementPage />);

    await user.click(
      screen.getByRole('button', { name: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.PLANNING] })
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${BOQ_MANAGEMENT_TABS.PLANNING}`),
        { scroll: false }
      );
    });
  });

  it('calls router.replace with tab=final when switching to Final', async () => {
    const user = userEvent.setup();
    render(<BOQManagementPage />);

    await user.click(
      screen.getByRole('button', { name: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.FINAL] })
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${BOQ_MANAGEMENT_TABS.FINAL}`),
        { scroll: false }
      );
    });
  });

  it('does not include tab param when switching back to Template', async () => {
    const user = userEvent.setup();
    render(<BOQManagementPage />);

    await user.click(
      screen.getByRole('button', { name: BOQ_MANAGEMENT_TAB_LABELS[BOQ_MANAGEMENT_TABS.TEMPLATE] })
    );

    await waitFor(() => {
      const lastCall = mockReplace.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).not.toContain('tab=');
    });
  });
});
