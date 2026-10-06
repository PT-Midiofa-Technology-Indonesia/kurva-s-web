import { describe, expect, it } from 'vitest';
import { createBOQExecutionCostColumns } from './boq-execution-cost-columns';

describe('createBOQExecutionCostColumns editableSuffixes', () => {
  it('marks cco/actual columns editable when suffixes present', () => {
    const { columns } = createBOQExecutionCostColumns({
      sectionValue: 'material_cost',
      disabled: false,
      editableSuffixes: new Set(['cco', 'actual']),
    });
    const volCco = columns.find((c) => (c as { id?: string }).id === 'vol_cco');
    const volAct = columns.find((c) => (c as { id?: string }).id === 'vol_actual');
    const volRab = columns.find((c) => (c as { id?: string }).id === 'vol_rab');

    expect((volCco?.meta as { editable?: boolean })?.editable).toBe(true);
    expect((volAct?.meta as { editable?: boolean })?.editable).toBe(true);
    expect((volRab?.meta as { editable?: boolean })?.editable).toBe(false);
  });

  it('disables cco columns when suffix excluded (isSideInstruction)', () => {
    const { columns } = createBOQExecutionCostColumns({
      sectionValue: 'material_cost',
      disabled: false,
      editableSuffixes: new Set(['actual']), // 'cco' removed by page when isSideInstruction
    });
    const volCco = columns.find((c) => (c as { id?: string }).id === 'vol_cco');
    const volAct = columns.find((c) => (c as { id?: string }).id === 'vol_actual');

    expect((volCco?.meta as { editable?: boolean })?.editable).toBe(false);
    expect((volAct?.meta as { editable?: boolean })?.editable).toBe(true);
  });

  it('disables all editable columns when suffix set empty (complete)', () => {
    const { columns } = createBOQExecutionCostColumns({
      sectionValue: 'material_cost',
      disabled: true, // dialog computes disabled from empty suffix set
    });
    const volCco = columns.find((c) => (c as { id?: string }).id === 'vol_cco');
    const volAct = columns.find((c) => (c as { id?: string }).id === 'vol_actual');

    expect((volCco?.meta as { editable?: boolean })?.editable).toBe(false);
    expect((volAct?.meta as { editable?: boolean })?.editable).toBe(false);
  });

  it('marks duration cco columns non-editable when cco excluded (equipment)', () => {
    const { columns } = createBOQExecutionCostColumns({
      sectionValue: 'equipment_cost',
      disabled: false,
      editableSuffixes: new Set(['actual']),
    });
    const durCco = columns.find((c) => (c as { id?: string }).id === 'durasi_sewa_cco');
    const durAct = columns.find((c) => (c as { id?: string }).id === 'durasi_sewa_actual');

    expect((durCco?.meta as { editable?: boolean })?.editable).toBe(false);
    expect((durAct?.meta as { editable?: boolean })?.editable).toBe(true);
  });
});
