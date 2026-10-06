import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { BOQPlanningPage } from '../BOQPlanningDetailPage';

function mockIncompleteProjectBOQ() {
  server.use(
    http.get(getApiPath('/projects/:projectId/boq'), () =>
      HttpResponse.json({
        success: true,
        message: 'Data BOQ project berhasil diambil.',
        data: {
          project: {
            id: 'proj-001',
            code: 'PRJ-001',
            name: 'Office Building Project',
            description: 'A sample project',
            currentStage: 'planning',
            currentStageName: 'Planning',
            estimatedValue: 500000000,
            projectStartDate: '2026-01-01',
            projectEndDate: '2026-12-31',
            startedAt: null,
            tenderSubmissionDeadline: null,
            outcomeReason: null,
            isActive: true,
            isRabComplete: false,
            isLimitBudgetComplete: true,
            isCcoComplete: false,
            company: { id: 'comp-001', name: 'PT Test Company' },
            client: { id: 'client-001', name: 'Client ABC' },
            createdBy: { id: 'user-001', name: 'Admin' },
            projectType: null,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
          boq: {
            id: 'boq-001',
            projectId: 'proj-001',
            boqTemplateId: 'tmpl-001',
            code: 'BOQ-001',
            name: 'Main BOQ',
            limitBudgetPercentage: '100',
            isRabComplete: false,
            isLimitBudgetComplete: true,
            isCcoComplete: false,
            isActive: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
            items: [
              {
                id: 'proj-item-root',
                parentId: null,
                sortOrder: 1,
                level: 1,
                code: 'A',
                name: 'Pekerjaan Beton',
                isFinalLevel: false,
                weight: null,
                scheduleStartDate: null,
                scheduleEndDate: null,
                volumeRab: null,
                volumeCco: null,
                volumeActual: null,
                uomId: null,
                unitPriceMaterialRab: null,
                unitPriceWorkRab: null,
                totalAmountRab: null,
                remarks: null,
                isActive: true,
                jobItemType: { id: 'jt-001', name: 'Job' },
                children: [
                  {
                    id: 'proj-item-leaf',
                    parentId: 'proj-item-root',
                    sortOrder: 1,
                    level: 2,
                    code: 'A.1',
                    name: 'Pondasi',
                    isFinalLevel: true,
                    weight: '25',
                    scheduleStartDate: null,
                    scheduleEndDate: null,
                    volumeRab: '100',
                    volumeCco: null,
                    volumeActual: null,
                    uomId: '1',
                    uom: { id: '1', code: 'M', name: 'Meter' },
                    unitPriceMaterialRab: '500000',
                    unitPriceWorkRab: '200000',
                    totalAmountRab: '70000000',
                    remarks: 'Sample remark',
                    isActive: true,
                    jobItemType: { id: 'jt-001', name: 'Job' },
                    children: [],
                  },
                ],
              },
            ],
          },
        },
      })
    )
  );
}

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/project-control/boq-management/planning/proj-001',
  useSearchParams: () => new URLSearchParams(),
}));

describe('BOQPlanningDetailPage Integration', () => {
  it('renders bobot value from API weight field', async () => {
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });

    // leaf weight='25' from API → bobot cell renders '25'
    // parent has null weight → rollup from child → also '25'
    // both cells render the same value; verify at least one exists
    expect(screen.queryAllByText('25').length).toBeGreaterThanOrEqual(1);
  });

  it('renders project info card after loading', async () => {
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Office Building Project')).toBeInTheDocument();
    });
  });

  it('renders BOQ tree section after loading', async () => {
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });
  });

  it('renders page header with BOQ Planning title', async () => {
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('BOQ Planning')).toBeInTheDocument();
    });
  });

  it('renders Generate Quotation and Lihat Resume buttons', async () => {
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });
    expect(screen.getByText('Generate Quotation')).toBeInTheDocument();
    expect(screen.getByText('Lihat Resume')).toBeInTheDocument();
  });

  it('Generate Quotation button is disabled initially', async () => {
    mockIncompleteProjectBOQ();
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });
    const generateBtn = screen.getByText('Generate Quotation').closest('button');
    expect(generateBtn).toBeDisabled();
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Office Building Project')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/project-control/boq-management');
  });

  it('search filters tree nodes', async () => {
    const user = userEvent.setup();
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Pencarian');
    await user.type(searchInput, 'Pondasi');

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });
    expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
  });

  it('renders Lihat Resume button after loading', async () => {
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });

    expect(screen.getByText('Lihat Resume')).toBeInTheDocument();
  });

  it('eye icon opens cost dialog for leaf node', async () => {
    const user = userEvent.setup();
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });

    const eyeButton = screen.getByRole('button', { name: 'Lihat detail' });
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('cost dialog shows cost sections', async () => {
    const user = userEvent.setup();
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });

    const eyeButton = screen.getByRole('button', { name: 'Lihat detail' });
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Material Cost')).toBeInTheDocument();
    expect(screen.getByText('Equipment Cost')).toBeInTheDocument();
  });

  it('cost dialog shows material items from API', async () => {
    const user = userEvent.setup();
    render(<BOQPlanningPage projectId="proj-001" />);

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });

    const eyeButton = screen.getByRole('button', { name: 'Lihat detail' });
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByText('Semen')).toBeInTheDocument();
    });
  });
});
