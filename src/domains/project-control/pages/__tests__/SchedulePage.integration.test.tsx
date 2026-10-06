import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { SchedulePage } from '../SchedulePage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: 'proj-001' }),
  usePathname: () => '/project-control/project/proj-001/schedule',
  useSearchParams: () => new URLSearchParams(),
}));

describe('SchedulePage Integration', () => {
  it('renders project info card after loading', async () => {
    render(<SchedulePage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getAllByText('Office Building Project').length).toBeGreaterThan(0);
    });
  });

  it('renders the schedule tree seeded from BOQ items', async () => {
    render(<SchedulePage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pekerjaan Beton')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Pondasi')).toBeInTheDocument();
  });

  it('navigates back to the project list when back is clicked', async () => {
    const user = userEvent.setup();
    render(<SchedulePage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getAllByText('Office Building Project').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(mockPush).toHaveBeenCalledWith('/project-control/project?tab=project');
  });

  it('saves schedule changes and shows a success toast', async () => {
    const user = userEvent.setup();
    render(<SchedulePage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pekerjaan Beton')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tambah'));

    await waitFor(() => {
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Simpan'));

    await waitFor(() => {
      expect(screen.getByText('Jadwal Project berhasil diperbarui')).toBeInTheDocument();
    });
  });
});
