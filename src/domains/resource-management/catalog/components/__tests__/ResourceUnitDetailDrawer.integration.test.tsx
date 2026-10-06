import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/shared/utils/test-utils';
import { ResourceUnitDetailDrawer } from '../ResourceUnitDetailDrawer';

describe('ResourceUnitDetailDrawer', () => {
  it('does not render when open is false', () => {
    renderWithProviders(<ResourceUnitDetailDrawer open={false} onClose={vi.fn()} id="unit-1" />);

    expect(screen.queryByText('Resource Unit Detail')).not.toBeInTheDocument();
  });

  it('displays drawer with title when open', async () => {
    renderWithProviders(<ResourceUnitDetailDrawer open={true} onClose={vi.fn()} id="unit-1" />);

    await waitFor(() => {
      expect(screen.getByText('Resource Unit Detail')).toBeInTheDocument();
    });
  });

  it('displays unit data when open and loaded', async () => {
    renderWithProviders(<ResourceUnitDetailDrawer open={true} onClose={vi.fn()} id="unit-1" />);

    await waitFor(() => {
      expect(screen.getByText('UNIT-001')).toBeInTheDocument();
      expect(screen.getByText('Excavator')).toBeInTheDocument();
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });
  });

  it('displays formatted acquisition cost in IDR', async () => {
    renderWithProviders(<ResourceUnitDetailDrawer open={true} onClose={vi.fn()} id="unit-1" />);

    await waitFor(() => {
      const costText = screen.getByText(/Rp/);
      expect(costText).toBeInTheDocument();
      expect(costText.textContent).toMatch(/500.000.000/);
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();

    renderWithProviders(<ResourceUnitDetailDrawer open={true} onClose={onClose} id="unit-1" />);

    await waitFor(() => {
      expect(screen.getByText('UNIT-001')).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await userEvent.click(closeButtons[closeButtons.length - 1]);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();

    renderWithProviders(
      <ResourceUnitDetailDrawer open={true} onClose={vi.fn()} onEdit={onEdit} id="unit-1" />
    );

    await waitFor(() => {
      expect(screen.getByText('UNIT-001')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('displays allocated status when status is allocated', async () => {
    renderWithProviders(
      <ResourceUnitDetailDrawer open={true} onClose={vi.fn()} id="allocatedUnit" />
    );

    await waitFor(() => {
      expect(screen.getByText('allocated')).toBeInTheDocument();
    });
  });

  it('displays placeholder for missing notes', async () => {
    renderWithProviders(
      <ResourceUnitDetailDrawer open={true} onClose={vi.fn()} id="unitNoNotes" />
    );

    await waitFor(() => {
      expect(screen.getByText('UNIT-003')).toBeInTheDocument();
    });

    const dashElements = screen.getAllByText('-');
    expect(dashElements.length).toBeGreaterThan(0);
  });
});
