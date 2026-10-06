export function canEditLeave(status?: string | null) {
  return status !== 'approved' && status !== 'cancelled';
}
