import { describe, expect, it, vi } from 'vitest';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { ProgressMonitoringPage } from '../ProgressMonitoringPage';

const mockParams: { id?: string } = { id: 'proj-001' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => mockParams,
  usePathname: () => '/project-control/project/proj-001/progress-monitoring',
  useSearchParams: () => new URLSearchParams(),
}));

describe('ProgressMonitoringPage Integration', () => {
  it('renders real project info from the BOQ API instead of mock data', async () => {
    render(<ProgressMonitoringPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getAllByText('Office Building Project').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('PT Test Company')).toBeInTheDocument();
    expect(screen.getByText('Client ABC')).toBeInTheDocument();
  });

  it('renders the WBS task table from BOQ task data', async () => {
    render(<ProgressMonitoringPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getAllByText('Office Building Project').length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });
  });

  it('does not fall back to selected project store on route page when route param is missing', async () => {
    mockParams.id = undefined;
    useSelectedProjectStore.setState({ selectedProjectId: 'proj-001' });

    render(<ProgressMonitoringPage />);

    await waitFor(() => {
      expect(screen.getByText('Tidak ada data task')).toBeInTheDocument();
    });

    mockParams.id = 'proj-001';
  });

  it('uses selected project store for the project-management source', async () => {
    mockParams.id = undefined;
    useSelectedProjectStore.setState({ selectedProjectId: 'proj-001' });

    render(<ProgressMonitoringPage source="project-management" />);

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });

    mockParams.id = 'proj-001';
  });
});
