import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { formatIDR } from '@/shared/utils/currency';
import { render, screen } from '@/shared/utils/test-utils';
import { CostRequestItemStagingRow } from '../CostRequestItemStagingRow';

describe('CostRequestItemStagingRow', () => {
  it('renders the staging fields inside a dialog', () => {
    render(<CostRequestItemStagingRow open onOpenChange={vi.fn()} onAdd={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cost item/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/item description/i)).toBeInTheDocument();
  });

  it('formats the amount as IDR while keeping a numeric draft value', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<CostRequestItemStagingRow open onOpenChange={vi.fn()} onAdd={onAdd} />);

    const descriptionInput = screen.getByPlaceholderText(/item description/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);
    await user.type(descriptionInput, 'Office supplies');
    await user.type(amountInput, '12312');

    expect(amountInput).toHaveValue(formatIDR(12312));

    await user.click(screen.getByRole('button', { name: /simpan/i }));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ amount: 12312 }));
  });
});
