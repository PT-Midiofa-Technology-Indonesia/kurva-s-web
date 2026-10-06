import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';

vi.mock('@/shared/components/molecules/DatePicker', () => ({
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <input
      type="date"
      aria-label={placeholder ?? 'Date Required'}
      value={value instanceof Date ? value.toISOString().slice(0, 10) : ''}
      onChange={(e) => onChange?.(e.target.value ? new Date(e.target.value) : undefined)}
    />
  ),
}));

import { PurchaseRequestManualDialog } from '../PurchaseRequestManualDialog';

const baseProps = {
  boqItemId: 'item-1',
  itemName: 'Penataan Bata Dinding',
  projectId: 'proj-1',
  companyId: 'comp-1',
  open: true,
  onOpenChange: vi.fn(),
  onCreated: vi.fn(),
};

async function setVol(rowText: string, value: string) {
  const user = userEvent.setup();
  const row = screen.getByText(rowText).closest('tr');
  if (!row) throw new Error(`row for "${rowText}" not found`);
  const cells = within(row).getAllByRole('cell');
  // columns: select, code, name, volumeRab, cco, volumeAct, existingPr, max, vol, uom, remarks
  const volCell = cells[8];
  await user.dblClick(volCell);
  const input = within(volCell).getByRole('textbox');
  await user.clear(input);
  await user.type(input, value);
  await user.keyboard('{Enter}');
}

async function setRemarks(rowText: string, value: string) {
  const user = userEvent.setup();
  const row = screen.getByText(rowText).closest('tr');
  if (!row) throw new Error(`row for "${rowText}" not found`);
  const cells = within(row).getAllByRole('cell');
  const remarksCell = cells[10];
  await user.dblClick(remarksCell);
  const input = within(remarksCell).getByRole('textbox');
  await user.clear(input);
  await user.type(input, value);
  await user.keyboard('{Enter}');
}

async function pickDate(dateValue: string) {
  const user = userEvent.setup();
  const input = screen.getByLabelText('Date Required');
  await user.clear(input);
  await user.type(input, dateValue);
}

describe('PurchaseRequestManualDialog', () => {
  it('renders the item name as title, section labels, and the disabled row', async () => {
    render(<PurchaseRequestManualDialog {...baseProps} />);

    expect(screen.getByText('Penataan Bata Dinding')).toBeInTheDocument();
    expect(await screen.findByText('Material & Tools')).toBeInTheDocument();
    expect(screen.getByText('Service & Rental')).toBeInTheDocument();
    expect(screen.getByText('Jasa Pengecatan Dinding')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /Pilih Jasa Pengecatan Dinding/i,
    });
    expect(checkbox).not.toBeDisabled();
  });

  it('enables Submit when a row is selected and date is chosen', async () => {
    const user = userEvent.setup();
    render(<PurchaseRequestManualDialog {...baseProps} />);

    await screen.findByText('Material & Tools');
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: /Pilih Bata Merah/i }));
    expect(submitButton).toBeDisabled();

    await pickDate('2026-07-15');
    expect(submitButton).toBeEnabled();
  });

  it('submits the selected items with the correct payload and calls onCreated', async () => {
    let capturedBody: unknown;
    server.use(
      http.post(getHandlerPath('/procurement/purchase-requests/manual'), async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ success: true, message: 'OK', data: null });
      })
    );

    const onCreated = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PurchaseRequestManualDialog
        {...baseProps}
        onCreated={onCreated}
        onOpenChange={onOpenChange}
      />
    );

    await screen.findByText('Material & Tools');
    await user.click(screen.getByRole('checkbox', { name: /Pilih Bata Merah/i }));
    await pickDate('2026-07-15');
    // vol editing is gated behind the checkbox (editableWhen) — check first, then edit
    await setVol('Bata Merah ukuran 20x40', '50');
    await setRemarks('Bata Merah ukuran 20x40', 'Merek Tiga Roda');

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(capturedBody).toEqual({
      projectId: 'proj-1',
      dateRequired: '2026-07-15',
      items: [
        {
          itemType: 'materialTool',
          item: [
            {
              boqItemCostId: 'cost-row-1',
              quantity: 50,
              remarks: 'Merek Tiga Roda',
            },
          ],
        },
      ],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
