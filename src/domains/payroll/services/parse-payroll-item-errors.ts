const ITEM_ERROR_KEY = /^items\.(\d+)\.(.+)$/;

export type PayrollItemErrors = Record<string, Record<string, string>>;

/**
 * The API reports item errors by their position in the submitted payload
 * (`items.0.default_amount`), while the drawers key their errors by component id.
 * `componentIds` is that payload in order, so the index resolves without guesswork.
 */
export function parsePayrollItemErrors(
  fieldErrors: Record<string, string[]> | undefined,
  componentIds: string[]
): PayrollItemErrors {
  if (!fieldErrors) return {};

  const parsed: PayrollItemErrors = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const match = ITEM_ERROR_KEY.exec(key);
    if (!match) continue;

    const message = messages?.[0];
    if (!message) continue;

    const componentId = componentIds[Number(match[1])];
    if (!componentId) continue;

    parsed[componentId] = { ...parsed[componentId], [match[2]]: message };
  }

  return parsed;
}

/**
 * True when at least one error points at a specific row, which the drawer renders
 * on that row's inputs. A form-wide `items` error has no row and still needs a toast.
 */
export function hasPayrollRowErrors(fieldErrors: Record<string, string[]> | undefined): boolean {
  if (!fieldErrors) return false;
  return Object.keys(fieldErrors).some((key) => ITEM_ERROR_KEY.test(key));
}
