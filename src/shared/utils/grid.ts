// Full static lookup tables — kept here so Tailwind's scanner detects every class string.
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ColSpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type RowSpanValue = 1 | 2 | 3 | 4 | 5 | 6;
export type ColSpan = ColSpanValue | Partial<Record<'base' | Breakpoint, ColSpanValue>>;
export type RowSpan = RowSpanValue | Partial<Record<'base' | Breakpoint, RowSpanValue>>;

export const COL: Record<'base' | Breakpoint, Record<ColSpanValue, string>> = {
  base: {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  },
  sm: {
    1: 'sm:col-span-1',
    2: 'sm:col-span-2',
    3: 'sm:col-span-3',
    4: 'sm:col-span-4',
    5: 'sm:col-span-5',
    6: 'sm:col-span-6',
    7: 'sm:col-span-7',
    8: 'sm:col-span-8',
    9: 'sm:col-span-9',
    10: 'sm:col-span-10',
    11: 'sm:col-span-11',
    12: 'sm:col-span-12',
  },
  md: {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
    5: 'md:col-span-5',
    6: 'md:col-span-6',
    7: 'md:col-span-7',
    8: 'md:col-span-8',
    9: 'md:col-span-9',
    10: 'md:col-span-10',
    11: 'md:col-span-11',
    12: 'md:col-span-12',
  },
  lg: {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12',
  },
  xl: {
    1: 'xl:col-span-1',
    2: 'xl:col-span-2',
    3: 'xl:col-span-3',
    4: 'xl:col-span-4',
    5: 'xl:col-span-5',
    6: 'xl:col-span-6',
    7: 'xl:col-span-7',
    8: 'xl:col-span-8',
    9: 'xl:col-span-9',
    10: 'xl:col-span-10',
    11: 'xl:col-span-11',
    12: 'xl:col-span-12',
  },
  '2xl': {
    1: '2xl:col-span-1',
    2: '2xl:col-span-2',
    3: '2xl:col-span-3',
    4: '2xl:col-span-4',
    5: '2xl:col-span-5',
    6: '2xl:col-span-6',
    7: '2xl:col-span-7',
    8: '2xl:col-span-8',
    9: '2xl:col-span-9',
    10: '2xl:col-span-10',
    11: '2xl:col-span-11',
    12: '2xl:col-span-12',
  },
};

export const ROW: Record<'base' | Breakpoint, Record<RowSpanValue, string>> = {
  base: {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    5: 'row-span-5',
    6: 'row-span-6',
  },
  sm: {
    1: 'sm:row-span-1',
    2: 'sm:row-span-2',
    3: 'sm:row-span-3',
    4: 'sm:row-span-4',
    5: 'sm:row-span-5',
    6: 'sm:row-span-6',
  },
  md: {
    1: 'md:row-span-1',
    2: 'md:row-span-2',
    3: 'md:row-span-3',
    4: 'md:row-span-4',
    5: 'md:row-span-5',
    6: 'md:row-span-6',
  },
  lg: {
    1: 'lg:row-span-1',
    2: 'lg:row-span-2',
    3: 'lg:row-span-3',
    4: 'lg:row-span-4',
    5: 'lg:row-span-5',
    6: 'lg:row-span-6',
  },
  xl: {
    1: 'xl:row-span-1',
    2: 'xl:row-span-2',
    3: 'xl:row-span-3',
    4: 'xl:row-span-4',
    5: 'xl:row-span-5',
    6: 'xl:row-span-6',
  },
  '2xl': {
    1: '2xl:row-span-1',
    2: '2xl:row-span-2',
    3: '2xl:row-span-3',
    4: '2xl:row-span-4',
    5: '2xl:row-span-5',
    6: '2xl:row-span-6',
  },
};

export const BREAKPOINTS: Array<'base' | Breakpoint> = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

export function resolveColSpan(colSpan: ColSpan): string {
  if (typeof colSpan === 'number') return COL.base[colSpan];
  return BREAKPOINTS.flatMap((bp) => {
    const val = colSpan[bp];
    return val !== undefined ? [COL[bp][val]] : [];
  }).join(' ');
}

export function resolveRowSpan(rowSpan: RowSpan | undefined): string {
  if (rowSpan === undefined) return '';
  if (typeof rowSpan === 'number') return ROW.base[rowSpan];
  return BREAKPOINTS.flatMap((bp) => {
    const val = rowSpan[bp];
    return val !== undefined ? [ROW[bp][val]] : [];
  }).join(' ');
}
