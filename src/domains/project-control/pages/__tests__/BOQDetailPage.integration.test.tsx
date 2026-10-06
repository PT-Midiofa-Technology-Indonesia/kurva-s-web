import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { render, screen, waitFor } from '@/shared/utils/test-utils';

import { BOQDetailPage } from '../BOQDetailPage';

const mockPush = vi.fn();
const mockParams: { id?: string } = { id: 'proj-001' };
let mockPathname = '/project-control/project/proj-001/boq';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

describe('BOQDetailPage Integration', () => {
  // Full-suite parallel runs starve the worker; give these render-heavy integration tests more headroom
  it('uses route param project id when explicit prop is absent', { timeout: 20000 }, async () => {
    useSelectedProjectStore.setState({ selectedProjectId: null });

    render(<BOQDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Office Building Project' })).toBeInTheDocument();
    });

    expect(screen.queryByText('Project belum dipilih.')).not.toBeInTheDocument();
  });

  it('navigates back to project list tab', async () => {
    const user = userEvent.setup();
    useSelectedProjectStore.setState({ selectedProjectId: null });

    render(<BOQDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Office Building Project' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(mockPush).toHaveBeenCalledWith('/project-control/project?tab=project');
  });

  it('does not fall back to selected project store on route page when route param is missing', async () => {
    mockParams.id = undefined;
    mockPathname = '/project-control/project/missing/boq';
    useSelectedProjectStore.setState({ selectedProjectId: 'proj-001' });

    render(<BOQDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Project belum dipilih.')).toBeInTheDocument();
    });

    mockParams.id = 'proj-001';
    mockPathname = '/project-control/project/proj-001/boq';
  });

  it('uses selected project store for the project-management source', async () => {
    mockParams.id = undefined;
    useSelectedProjectStore.setState({ selectedProjectId: 'proj-001' });

    render(<BOQDetailPage source="project-management" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Office Building Project' })).toBeInTheDocument();
    });

    mockParams.id = 'proj-001';
  });
});
