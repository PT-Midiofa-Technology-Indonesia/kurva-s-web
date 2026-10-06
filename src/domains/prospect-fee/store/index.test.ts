import { beforeEach, describe, expect, it } from 'vitest';
import { useProspectFeeStore } from './index';

describe('useProspectFeeStore', () => {
  const initialState = useProspectFeeStore.getState();

  beforeEach(() => {
    useProspectFeeStore.setState(initialState, true);
  });

  it('seeds dummy fee rows and setting fee rows', () => {
    const state = useProspectFeeStore.getState();
    expect(state.feeRows.length).toBeGreaterThan(0);
    expect(state.settingFeeRows.length).toBeGreaterThan(0);
  });

  it('addSettingFeeRow appends a blank inactive row with no ranges', () => {
    const before = useProspectFeeStore.getState().settingFeeRows.length;
    useProspectFeeStore.getState().addSettingFeeRow();
    const rows = useProspectFeeStore.getState().settingFeeRows;
    expect(rows.length).toBe(before + 1);
    const added = rows[rows.length - 1];
    expect(added.projectCapability).toBe('');
    expect(added.status).toBe('inactive');
    expect(added.ranges).toEqual([]);
  });

  it('addSettingFeeRow defaults to the given company when provided', () => {
    useProspectFeeStore.getState().addSettingFeeRow({ id: 'company-2', name: 'Company 2' });
    const rows = useProspectFeeStore.getState().settingFeeRows;
    const added = rows[rows.length - 1];
    expect(added.companyId).toBe('company-2');
    expect(added.companyName).toBe('Company 2');
  });

  it('updateSettingFeeRow only patches the targeted row', () => {
    const [first, second] = useProspectFeeStore.getState().settingFeeRows;
    useProspectFeeStore.getState().updateSettingFeeRow(first.id, { status: 'active' });
    const rows = useProspectFeeStore.getState().settingFeeRows;
    expect(rows.find((r) => r.id === first.id)?.status).toBe('active');
    expect(rows.find((r) => r.id === second.id)?.status).toBe(second.status);
  });

  it('addFeeRange appends a blank range only to the targeted row', () => {
    const [first, second] = useProspectFeeStore.getState().settingFeeRows;
    const secondRangesBefore = second.ranges.length;
    useProspectFeeStore.getState().addFeeRange(first.id);
    const rows = useProspectFeeStore.getState().settingFeeRows;
    const updatedFirst = rows.find((r) => r.id === first.id)!;
    const updatedSecond = rows.find((r) => r.id === second.id)!;
    expect(updatedFirst.ranges.length).toBe(first.ranges.length + 1);
    expect(updatedSecond.ranges.length).toBe(secondRangesBefore);
  });

  it('updateFeeRange only patches the targeted range', () => {
    const row = useProspectFeeStore.getState().settingFeeRows.find((r) => r.ranges.length > 0)!;
    const [firstRange, secondRange] = row.ranges;
    useProspectFeeStore.getState().updateFeeRange(row.id, firstRange.id, { fee: 999 });
    const updatedRow = useProspectFeeStore.getState().settingFeeRows.find((r) => r.id === row.id)!;
    expect(updatedRow.ranges.find((r) => r.id === firstRange.id)?.fee).toBe(999);
    expect(updatedRow.ranges.find((r) => r.id === secondRange.id)?.fee).toBe(secondRange.fee);
  });
});
