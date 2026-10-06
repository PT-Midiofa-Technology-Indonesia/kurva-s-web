import { describe, expect, it } from 'vitest';
import {
  createBOQResumeEquipmentColumns,
  createBOQResumeMaterialColumns,
} from './boq-resume-columns';

describe('resume material columns', () => {
  it('marks only markup columns editable when not disabled', () => {
    const { columns } = createBOQResumeMaterialColumns({ disabled: false });
    const byId = (id: string) => columns.find((c) => (c as { id?: string }).id === id);
    expect((byId('materialMarkup')?.meta as { editable?: boolean })?.editable).toBe(true);
    expect((byId('transportMarkup')?.meta as { editable?: boolean })?.editable).toBe(true);
    expect((byId('amount')?.meta as { editable?: boolean })?.editable).toBe(false);
  });
  it('disables markup editing when disabled', () => {
    const { columns } = createBOQResumeMaterialColumns({ disabled: true });
    const byId = (id: string) => columns.find((c) => (c as { id?: string }).id === id);
    expect((byId('materialMarkup')?.meta as { editable?: boolean })?.editable).toBe(false);
  });
  it('builds a grouped header tree with cost groups', () => {
    const { headerColumnTree } = createBOQResumeMaterialColumns({ disabled: false });
    const ids = headerColumnTree.map((n) => n.id);
    expect(ids).toContain('material_cost');
    expect(ids).toContain('transportation_cost');
    expect(ids).toContain('total');
    expect(ids).toContain('amount');
  });
});

describe('resume equipment columns', () => {
  it('includes duration columns', () => {
    const { headerColumnTree } = createBOQResumeEquipmentColumns({ disabled: false });
    const ids = headerColumnTree.map((n) => n.id);
    expect(ids).toContain('duration');
    expect(ids).toContain('equipment_cost');
  });
});
