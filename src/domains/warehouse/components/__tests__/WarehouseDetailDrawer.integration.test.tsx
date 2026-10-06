import { describe, expect, it, vi } from 'vitest';
import { useWarehouse } from '@/domains/warehouse/hooks/use-warehouse';
import { fireEvent, render, screen } from '@/shared/utils/test-utils';
import { WAREHOUSE_LABELS } from '../../constants';
import { WarehouseDetailDrawer } from '../WarehouseDetailDrawer';

vi.mock('@/domains/warehouse/hooks/use-warehouse', () => ({
  useWarehouse: vi.fn(),
}));

const mockWarehouse = {
  id: '1',
  code: 'WH-001',
  name: 'Gudang Pusat',
  type: 'main_warehouse',
  isActive: true,
  company: { id: 'c1', code: 'COMP01', name: 'PT Test' },
  province: { id: 'p1', code: 'P01', name: 'Jawa Barat' },
  city: { id: 'city-1', code: 'C01', name: 'Bandung' },
  district: { id: 'dist-1', code: 'D01', name: 'Cicendo' },
  village: { id: 'vil-1', code: 'V01', name: 'Husein Sastranegara' },
  postalCode: null,
  addressDetail: 'Jl. Test No. 1',
  latitude: '-6.9',
  longitude: '107.6',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockUseWarehouse = vi.mocked(useWarehouse);

describe('WarehouseDetailDrawer Integration', () => {
  it('renders nothing when open is false', () => {
    mockUseWarehouse.mockReturnValue({ data: undefined, isLoading: false } as unknown as ReturnType<
      typeof useWarehouse
    >);
    render(<WarehouseDetailDrawer open={false} onClose={() => {}} id={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders warehouse data when open is true', () => {
    mockUseWarehouse.mockReturnValue({
      data: mockWarehouse,
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText(WAREHOUSE_LABELS.DETAIL.PAGE_TITLE)).toBeInTheDocument();
    expect(screen.getByText('WH-001')).toBeInTheDocument();
    expect(screen.getByText('Gudang Pusat')).toBeInTheDocument();
    expect(screen.getByText('COMP01 - PT Test')).toBeInTheDocument();
    expect(screen.getByText('Jawa Barat')).toBeInTheDocument();
    expect(screen.getByText('Bandung')).toBeInTheDocument();
    expect(screen.getByText('Jl. Test No. 1')).toBeInTheDocument();
  });

  it('shows active status by default', () => {
    mockUseWarehouse.mockReturnValue({
      data: mockWarehouse,
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText(WAREHOUSE_LABELS.DETAIL.STATUS_ACTIVE)).toBeInTheDocument();
  });

  it('shows inactive status when warehouse is inactive', () => {
    mockUseWarehouse.mockReturnValue({
      data: { ...mockWarehouse, isActive: false },
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText(WAREHOUSE_LABELS.DETAIL.STATUS_INACTIVE)).toBeInTheDocument();
  });

  it('opens confirm dialog when status switch is toggled', () => {
    mockUseWarehouse.mockReturnValue({
      data: mockWarehouse,
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={() => {}} id="1" />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(
      screen.getByText(WAREHOUSE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_TITLE)
    ).toBeInTheDocument();
  });

  it('closes confirm dialog on cancel', () => {
    mockUseWarehouse.mockReturnValue({
      data: mockWarehouse,
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={() => {}} id="1" />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(
      screen.getByText(WAREHOUSE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_TITLE)
    ).toBeInTheDocument();

    const cancelButton = screen
      .getAllByText('Batal')
      .find((btn) => btn.getAttribute('data-slot') === 'alert-dialog-cancel');
    fireEvent.click(cancelButton!);

    expect(
      screen.queryByText(WAREHOUSE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_TITLE)
    ).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    mockUseWarehouse.mockReturnValue({
      data: mockWarehouse,
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={onClose} id="1" />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    mockUseWarehouse.mockReturnValue({
      data: mockWarehouse,
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={() => {}} onEdit={onEdit} id="1" />);

    const editButton = screen.getByRole('button', { name: WAREHOUSE_LABELS.DETAIL.BUTTONS.EDIT });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders warehouse without geography data', () => {
    mockUseWarehouse.mockReturnValue({
      data: { ...mockWarehouse, province: null, city: null, district: null, village: null },
      isLoading: false,
    } as unknown as ReturnType<typeof useWarehouse>);
    render(<WarehouseDetailDrawer open={true} onClose={() => {}} id="1" />);

    expect(screen.getByText('WH-001')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(4);
  });
});
