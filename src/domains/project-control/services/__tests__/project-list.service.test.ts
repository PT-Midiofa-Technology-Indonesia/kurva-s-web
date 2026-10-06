import { describe, expect, it } from 'vitest';
import { mapProjectListItem } from '../project-list.service';

describe('project-list.service', () => {
  it('maps projectTypeCode from projectType.code', () => {
    const item = mapProjectListItem({
      id: 'p1',
      name: 'Gedung A',
      projectType: { id: 'pt-1', code: 'lumpsum', name: 'Lumpsum' },
    });

    expect(item.projectTypeCode).toBe('lumpsum');
    expect(item.projectTypeName).toBe('Lumpsum');
  });

  it('maps projectTypeCode to undefined when projectType is missing or has no code', () => {
    const itemWithoutType = mapProjectListItem({
      id: 'p2',
      name: 'Gedung B',
    });
    expect(itemWithoutType.projectTypeCode).toBeUndefined();

    const itemWithoutCode = mapProjectListItem({
      id: 'p3',
      name: 'Gedung C',
      projectType: { id: 'pt-2', code: null, name: 'Unit Price' },
    });
    expect(itemWithoutCode.projectTypeCode).toBeUndefined();
  });
});
