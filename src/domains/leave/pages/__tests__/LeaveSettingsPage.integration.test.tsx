import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { LEAVE_LABELS } from '../../constants';
import { LeaveSettingsPage } from '../LeaveSettingsPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('companyId=company-1'),
}));

describe('LeaveSettingsPage Integration', () => {
  it('renders the settings page title', async () => {
    render(<LeaveSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(LEAVE_LABELS.SETTINGS.TITLE)).toBeInTheDocument();
    });
  });

  it('does not render global leave rule fields', async () => {
    render(<LeaveSettingsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Default Kuota Tahunan')).not.toBeInTheDocument();
      expect(screen.queryByText('Maksimal Cuti Berturut-turut')).not.toBeInTheDocument();
    });
  });

  it('renders the leave types settings section', async () => {
    render(<LeaveSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(LEAVE_LABELS.SETTINGS.LEAVE_TYPES.TITLE)).toBeInTheDocument();
      expect(screen.getByText(LEAVE_LABELS.SETTINGS.LEAVE_TYPES.EMPTY)).toBeInTheDocument();
      expect(screen.queryByText('Cuti Tahunan')).not.toBeInTheDocument();
    });
  });
});
