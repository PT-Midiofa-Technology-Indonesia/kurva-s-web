import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/shared/utils/test-utils';
import { ResourceAllocationDetailDrawer } from '../ResourceAllocationDetailDrawer';

describe('ResourceAllocationDetailDrawer', () => {
  const mockAllocation = {
    id: 'alloc-1',
    code: 'ALLOC-001',
    project: { id: 'proj-1', code: 'PROJ01', name: 'Project A' },
    company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
    allocationType: 'unit',
    resourceUnit: {
      id: 'unit-1',
      code: 'UNIT-001',
      itemCatalog: { id: 'item-1', code: 'ITEM01', name: 'Excavator' },
      company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
      warehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
      status: 'allocated',
      acquisitionDate: '2024-01-01',
      acquisitionCost: '500000000',
      notes: null,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    itemCatalog: null,
    sourceWarehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
    quantity: null,
    allocatedFromDate: '2024-01-15',
    allocatedToDate: '2024-12-31',
    status: 'allocated',
    allocatedBy: { id: 'user-1', name: 'John Doe' },
    returnedAt: null,
    returnedBy: null,
    notes: 'Test allocation',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  it('does not render when open is false', () => {
    renderWithProviders(
      <ResourceAllocationDetailDrawer
        open={false}
        onClose={vi.fn()}
        id={mockAllocation.id}
        projectId="proj-1"
      />
    );

    expect(screen.queryByText('Allocation Detail')).not.toBeInTheDocument();
  });

  it('displays allocation data when open', async () => {
    renderWithProviders(
      <ResourceAllocationDetailDrawer
        open={true}
        onClose={vi.fn()}
        id={mockAllocation.id}
        projectId="proj-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockAllocation.code)).toBeInTheDocument();
      expect(screen.getByText(mockAllocation.project.name)).toBeInTheDocument();
      expect(screen.getByText(mockAllocation.company.name)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();

    renderWithProviders(
      <ResourceAllocationDetailDrawer
        open={true}
        onClose={onClose}
        id={mockAllocation.id}
        projectId="proj-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockAllocation.code)).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    const closeButton = closeButtons[closeButtons.length - 1]; // Get the Close button in footer, not X button
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();

    renderWithProviders(
      <ResourceAllocationDetailDrawer
        open={true}
        onClose={vi.fn()}
        onEdit={onEdit}
        id={mockAllocation.id}
        projectId="proj-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockAllocation.code)).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('handles quantity allocation type correctly', async () => {
    renderWithProviders(
      <ResourceAllocationDetailDrawer
        open={true}
        onClose={vi.fn()}
        id="alloc-2"
        projectId="proj-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('quantity')).toBeInTheDocument();
      expect(screen.getByText('Diesel')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });
});
