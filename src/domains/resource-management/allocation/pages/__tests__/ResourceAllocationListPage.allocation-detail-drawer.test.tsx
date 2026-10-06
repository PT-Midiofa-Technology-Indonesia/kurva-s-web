import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@/shared/utils/test-utils';

import { useMyProjects } from '../../hooks/use-my-projects';
import { useResourceAllocationPage } from '../../hooks/use-resource-allocation-page';
import { ResourceAllocationListPage } from '../ResourceAllocationListPage';

vi.mock('../../hooks/use-my-projects', () => ({
  useMyProjects: vi.fn(),
}));

vi.mock('../../hooks/use-resource-allocation-page', () => ({
  useResourceAllocationPage: vi.fn(),
}));

const mockUseMyProjects = vi.mocked(useMyProjects);
const mockUseResourceAllocationPage = vi.mocked(useResourceAllocationPage);

describe('ResourceAllocationListPage - Detail Drawer Flow', () => {
  beforeEach(() => {
    mockUseMyProjects.mockReturnValue({
      options: [{ value: 'project-1', label: 'Project 1' }],
      isLoading: false,
    } as ReturnType<typeof useMyProjects>);

    mockUseResourceAllocationPage.mockReturnValue({
      allocations: [
        { id: 'alloc-1', code: 'ALLOC-001', status: 'allocated', project: { name: 'Project 1' } },
        { id: 'alloc-2', code: 'ALLOC-002', status: 'allocated', project: { name: 'Project 1' } },
      ],
      totalItems: 2,
      totalPages: 1,
      isLoading: false,
      isError: false,
      handleAdd: vi.fn(),
      handleEdit: vi.fn(),
      handleDetail: vi.fn(),
      openDetailById: vi.fn(),
      detailTarget: null,
      handleDetailClose: vi.fn(),
      handleDetailEdit: vi.fn(),
      drawerOpen: false,
      editId: null,
      handleDrawerClose: vi.fn(),
      handleDrawerSuccess: vi.fn(),
    } as unknown as ReturnType<typeof useResourceAllocationPage>);
  });

  it('uses first project as effective default before first fetch/render', async () => {
    render(<ResourceAllocationListPage />);

    await waitFor(() => {
      expect(mockUseResourceAllocationPage).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-1',
          params: expect.objectContaining({ projectId: 'project-1' }),
        })
      );
    });
  });

  it('renders the list page and displays allocation data', async () => {
    render(<ResourceAllocationListPage />);

    // Wait for the page title to appear
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /resource allocation/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for table data to load (check for mock data code)
    await waitFor(
      () => {
        expect(screen.queryByText('ALLOC-001')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('displays action buttons for each allocation row', async () => {
    render(<ResourceAllocationListPage />);

    // Wait for the page title to appear
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /resource allocation/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for table data to load
    await waitFor(
      () => {
        expect(screen.queryByText('ALLOC-001')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify that there are action buttons in the rows
    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBeGreaterThan(0);
  });

  it('allocation list maintains data visibility', async () => {
    render(<ResourceAllocationListPage />);

    // Wait for the page title to appear
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /resource allocation/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for table data to load
    await waitFor(
      () => {
        expect(screen.queryByText('ALLOC-001')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify multiple allocations are visible
    expect(screen.queryByText('ALLOC-001')).toBeInTheDocument();
    expect(screen.queryByText('ALLOC-002')).toBeInTheDocument();
  });
});
