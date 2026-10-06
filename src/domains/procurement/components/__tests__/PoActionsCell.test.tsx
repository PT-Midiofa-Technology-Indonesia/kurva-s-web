import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PoActionsCell } from '../PoActionsCell';

describe('PoActionsCell', () => {
  it('shows cancel action for waiting approval status', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();

    render(<PoActionsCell status="waiting_approval" onCancel={handleCancel} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('menuitem', { name: 'Cancel PO' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Issue PO' })).not.toBeInTheDocument();
  });
});
