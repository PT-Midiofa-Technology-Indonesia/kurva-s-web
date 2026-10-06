import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { BOQManagementDetailRouter } from '../BOQManagementDetailRouter';

const mockParams = { id: '01a0133b-4f68-72d4-a0d1-339e17877305' };
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useParams: () => mockParams,
  usePathname: () => `/project-control/boq-management/${mockParams.id}/detail`,
  useSearchParams: () => mockSearchParams,
}));

vi.mock('../BOQPlanningDetailPage', () => ({
  BOQPlanningPage: ({ projectId, initialTab }: { projectId: string; initialTab?: string }) => (
    <div>
      Mock BOQPlanningPage: {projectId} (tab: {initialTab})
    </div>
  ),
}));

vi.mock('../BOQFinalDetailPage', () => ({
  BOQFinalPage: ({ projectId, initialTab }: { projectId: string; initialTab?: string }) => (
    <div>
      Mock BOQFinalPage: {projectId} (tab: {initialTab})
    </div>
  ),
}));

vi.mock('../BOQExecutionDetailPage', () => ({
  BOQExecutionDetailPage: ({
    projectId,
    initialTab,
  }: {
    projectId: string;
    initialTab?: string;
  }) => (
    <div>
      Mock BOQExecutionDetailPage: {projectId} (tab: {initialTab})
    </div>
  ),
}));

vi.mock('../BOQTemplateDetailPage', () => ({
  BOQTemplateDetailPage: ({ initialTab }: { initialTab?: string }) => (
    <div>Mock BOQTemplateDetailPage (tab: {initialTab})</div>
  ),
}));

describe('BOQManagementDetailRouter', () => {
  afterEach(() => {
    mockSearchParams = new URLSearchParams();
  });

  it('renders BOQPlanningPage when tab is planning', () => {
    mockSearchParams.set('tab', 'planning');
    render(<BOQManagementDetailRouter />);
    expect(
      screen.getByText(/Mock BOQPlanningPage: 01a0133b-4f68-72d4-a0d1-339e17877305/)
    ).toBeInTheDocument();
  });

  it('renders BOQFinalPage when tab is final', () => {
    mockSearchParams.set('tab', 'final');
    render(<BOQManagementDetailRouter />);
    expect(
      screen.getByText(/Mock BOQFinalPage: 01a0133b-4f68-72d4-a0d1-339e17877305/)
    ).toBeInTheDocument();
  });

  it('renders BOQExecutionDetailPage when tab is execution', () => {
    mockSearchParams.set('tab', 'execution');
    render(<BOQManagementDetailRouter />);
    expect(
      screen.getByText(/Mock BOQExecutionDetailPage: 01a0133b-4f68-72d4-a0d1-339e17877305/)
    ).toBeInTheDocument();
  });

  it('renders BOQTemplateDetailPage when tab is not set or anything else', () => {
    render(<BOQManagementDetailRouter />);
    expect(screen.getByText(/Mock BOQTemplateDetailPage/)).toBeInTheDocument();
  });
});
