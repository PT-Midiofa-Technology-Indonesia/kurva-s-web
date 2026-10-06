import { format } from 'date-fns';
import type { CreateCostRequestFormValues, EditCostRequestHeaderFormValues } from '../schemas';

export function buildCreateCostRequestFormData(input: CreateCostRequestFormValues): FormData {
  const fd = new FormData();
  fd.append('requestType', input.requestType);
  if (input.requestType === 'project' && input.projectId) {
    fd.append('projectId', input.projectId);
  }
  fd.append('employeeId', input.employeeId);
  fd.append('dueDate', format(input.dueDate, 'yyyy-MM-dd'));
  if (input.reason) fd.append('reason', input.reason);
  fd.append('paymentMethod', input.paymentMethod);
  if (input.notes) fd.append('notes', input.notes);

  input.items.forEach((item, index) => {
    fd.append(`items[${index}][description]`, item.description);
    fd.append(`items[${index}][amount]`, String(item.amount));
    if (item.receiptNumber) fd.append(`items[${index}][receiptNumber]`, item.receiptNumber);
    if (item.notes) fd.append(`items[${index}][notes]`, item.notes);
    item.proofFiles.forEach((file) => {
      fd.append(`items[${index}][proofs][]`, file);
    });
  });

  return fd;
}

/**
 * Open Question B (see plan): items[] semantics on PUT — full replace vs patch,
 * and whether untouched items' proofs survive — are unconfirmed with backend.
 * This mirrors the create shape for the header-only edit path; do not wire
 * item-content-editing UI to it until answered.
 */
export function buildUpdateCostRequestFormData(input: EditCostRequestHeaderFormValues): FormData {
  const fd = new FormData();
  fd.append('dueDate', format(input.dueDate, 'yyyy-MM-dd'));
  if (input.reason) fd.append('reason', input.reason);
  fd.append('paymentMethod', input.paymentMethod);
  if (input.notes) fd.append('notes', input.notes);

  input.items.forEach((item, index) => {
    if (item.id) fd.append(`items[${index}][id]`, item.id);
    fd.append(`items[${index}][description]`, item.description);
    fd.append(`items[${index}][amount]`, String(item.amount));
    if (item.receiptNumber) fd.append(`items[${index}][receiptNumber]`, item.receiptNumber);
    if (item.notes) fd.append(`items[${index}][notes]`, item.notes);
    item.proofFiles.forEach((file) => {
      fd.append(`items[${index}][proofs][]`, file);
    });
  });

  return fd;
}
