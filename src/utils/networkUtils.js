/**
 * PlotBy Network Utility
 * Distinguishes genuine offline/network connectivity errors from
 * Supabase validation, authentication, permission, or database schema errors.
 */

export function isNetworkError(error) {
  if (!error) return false;

  // Web environment offline indicator
  if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
    return true;
  }

  // Explicit Supabase / PostgreSQL error codes are NOT offline connectivity errors
  const errorCode = typeof error.code === 'string' ? error.code : '';
  if (
    errorCode.startsWith('PGRST') ||
    errorCode.startsWith('23') || // Postgres integrity violation
    errorCode.startsWith('42') || // Postgres syntax / column / permission error
    errorCode === 'AUTH_REQUIRED' ||
    errorCode === 'OWNERSHIP_REQUIRED' ||
    error.name === 'PropertyAccessError'
  ) {
    return false;
  }

  // If a server returned an HTTP 4xx or 5xx status response, the server was reached
  if (typeof error.status === 'number' && error.status >= 400 && error.status < 600) {
    return false;
  }

  const message = (error.message || String(error)).toLowerCase();

  const networkSignatures = [
    'network request failed',
    'failed to fetch',
    'networkerror',
    'network error',
    'offline',
    'internet disconnected',
    'the internet connection appears to be offline',
    'connection lost',
    'enotfound',
    'econnreset',
    'econnrefused',
    'etimedout',
    'ehostunreach',
    'err_internet_disconnected',
    'err_name_not_resolved',
    'err_connection_timed_out',
    'err_connection_refused',
  ];

  return networkSignatures.some(sig => message.includes(sig));
}

export default isNetworkError;
