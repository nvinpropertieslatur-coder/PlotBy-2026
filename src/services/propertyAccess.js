export class PropertyAccessError extends Error {
  constructor(code) {
    super(code === 'AUTH_REQUIRED'
      ? 'This saved account property is available only after signing in.'
      : 'Your account property storage needs an owner column before it can be used.');
    this.name = 'PropertyAccessError';
    this.code = code;
  }
}
export function isMissingOwnerColumn(error, column) {
  return (error.code === '42703' || error.code === 'PGRST204') && !!error.message?.includes(column);
}
export function resolvePropertyOwnerColumn(configured) {
  const column = configured?.trim() || 'user_id';
  if (!/^[a-z_][a-z0-9_]*$/i.test(column)) throw new PropertyAccessError('OWNERSHIP_REQUIRED');
  return column;
}
