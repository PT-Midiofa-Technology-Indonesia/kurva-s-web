import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { PurchaseRequestBundleDialog } from '../PurchaseRequestBundleDialog';

const baseProps = {
  boqItemId: 'item-001',
  projectId: 'proj-001',
  companyId: 'comp-001',
  open: true,
  onOpenChange: vi.fn(),
  onCreated: vi.fn(),
};

describe('PurchaseRequestBundleDialog', () => {
  it('renders the "Create Bundle PR" title with date field', () => {
    render(<PurchaseRequestBundleDialog {...baseProps} />);

    expect(screen.getByText('Create Bundle PR')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Required')).toBeInTheDocument();
    expect(screen.queryByLabelText('Notes')).not.toBeInTheDocument();
  });

  it('keeps Submit disabled until date and at least one category are set', async () => {
    const user = userEvent.setup();
    render(<PurchaseRequestBundleDialog {...baseProps} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText('Date Required'), '2026-07-20');
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'Material' }));
    expect(submitButton).toBeEnabled();
  });

  it('"Pilih semua" checks all three categories', async () => {
    const user = userEvent.setup();
    render(<PurchaseRequestBundleDialog {...baseProps} />);

    await user.click(screen.getByRole('switch', { name: 'Pilih semua' }));

    expect(screen.getByRole('checkbox', { name: 'Material' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Jasa Penyewaan' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Jasa Pengerjaan' })).toBeChecked();
  });

  it('submits the bundle payload with selected categories and calls onCreated', async () => {
    let capturedBody: unknown;
    server.use(
      http.post(getHandlerPath('/procurement/purchase-requests/bundle'), async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ success: true, message: 'OK', data: null });
      })
    );

    const onCreated = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PurchaseRequestBundleDialog
        {...baseProps}
        onCreated={onCreated}
        onOpenChange={onOpenChange}
      />
    );

    await user.type(screen.getByLabelText('Date Required'), '2026-07-20');
    await user.click(screen.getByRole('switch', { name: 'Pilih semua' }));
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(capturedBody).toEqual({
      projectId: 'proj-001',
      boqItemId: 'item-001',
      categories: ['material', 'equipment', 'manpower'],
      dateRequired: '2026-07-20',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
