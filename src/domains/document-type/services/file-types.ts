import { FILE_TYPE_OPTIONS, type FileTypeValue } from '../constants';

const ALL_FILE_TYPE_VALUES: FileTypeValue[] = FILE_TYPE_OPTIONS.map((opt) => opt.value);

export function parseFileTypesString(value: string | null | undefined): FileTypeValue[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter((v): v is FileTypeValue => (ALL_FILE_TYPE_VALUES as string[]).includes(v));
}

export function buildFileTypesString(values: Partial<Record<FileTypeValue, boolean>>): string {
  return Object.entries(values)
    .filter(([, checked]) => Boolean(checked))
    .map(([key]) => key)
    .join(',');
}

export function buildFileTypeFlags(
  value: string | null | undefined
): Record<FileTypeValue, boolean> {
  const active = parseFileTypesString(value);
  return ALL_FILE_TYPE_VALUES.reduce(
    (acc, key) => {
      acc[key] = active.includes(key);
      return acc;
    },
    {} as Record<FileTypeValue, boolean>
  );
}
