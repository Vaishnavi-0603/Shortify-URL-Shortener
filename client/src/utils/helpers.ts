/** Build the full short URL from a short code */
export const buildShortUrl = (shortCode: string): string => {
  const base = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  return `${base}/${shortCode}`;
};

/** Format an ISO date string to a human-readable format */
export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(iso));
};

/** Format an ISO date to relative time (e.g. "2 hours ago") */
export const relativeTime = (iso: string | null | undefined): string => {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/** Truncate a long URL for display */
export const truncateUrl = (url: string, maxLen = 50): string =>
  url.length > maxLen ? `${url.slice(0, maxLen)}...` : url;

/** Copy text to clipboard, returns success boolean */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** Extract a readable error message from an Axios error */
export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
};

/** Check if a URL is expired */
export const isExpired = (expiryDate: string | null): boolean => {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
};
