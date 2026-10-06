import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { COMPANY_LABELS } from '../../constants';
import { AddDepartmentDrawer } from '../AddDepartmentDrawer';

// Polyfill for jsdom which doesn't support setPointerCapture (used by vaul)
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

describe('AddDepartmentDrawer Integration', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when open', () => {
    render(
      <AddDepartmentDrawer
        open={true}
        onClose={mockOnClose}
        companyId="1"
        companyName="PT Test"
        existingDepartments={[]}
      />
    );
  });

  it('does not render drawer content when closed', () => {
    render(
      <AddDepartmentDrawer
        open={false}
        onClose={mockOnClose}
        companyId="1"
        companyName="PT Test"
        existingDepartments={[]}
      />
    );
    expect(
      screen.queryByRole('heading', { name: COMPANY_LABELS.ADD_DEPARTMENT.TITLE })
    ).not.toBeInTheDocument();
  });

  it('displays drawer title', async () => {
    render(
      <AddDepartmentDrawer
        open={true}
        onClose={mockOnClose}
        companyId="1"
        companyName="PT Test"
        existingDepartments={[]}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: COMPANY_LABELS.ADD_DEPARTMENT.TITLE })
      ).toBeInTheDocument();
    });
  });

  it('displays company name', async () => {
    render(
      <AddDepartmentDrawer
        open={true}
        onClose={mockOnClose}
        companyId="1"
        companyName="PT Test Company"
        existingDepartments={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('PT Test Company')).toBeInTheDocument();
    });
  });

  it('displays department field label', async () => {
    render(
      <AddDepartmentDrawer
        open={true}
        onClose={mockOnClose}
        companyId="1"
        companyName="PT Test"
        existingDepartments={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(COMPANY_LABELS.ADD_DEPARTMENT.FIELD_LABEL)).toBeInTheDocument();
    });
  });

  it('save button is enabled when drawer is open', async () => {
    render(
      <AddDepartmentDrawer
        open={true}
        onClose={mockOnClose}
        companyId="1"
        companyName="PT Test"
        existingDepartments={[]}
      />
    );

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: COMPANY_LABELS.ADD_DEPARTMENT.SAVE });
      expect(saveButton).toBeEnabled();
    });
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AddDepartmentDrawer
        open={true}
        onClose={mockOnClose}
        companyId="1"
        companyName="PT Test"
        existingDepartments={[]}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.ADD_DEPARTMENT.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
