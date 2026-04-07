// ---------------------------------------------------------------------------
// Date formatting utilities
// ---------------------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function toDate(value: string): Date {
  return new Date(value);
}

function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime());
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Human-friendly relative timestamp.
 *
 * Past:   "2m ago", "1h ago", "2d ago"
 * Future: "in 3h", "in 5d"
 *
 * Returns "—" for missing or invalid date strings.
 */
export function formatRelative(date: string): string {
  if (!date) return "\u2014";
  const d = toDate(date);
  if (!isValidDate(d)) return "\u2014";

  const now = Date.now();
  const target = d.getTime();
  const diffMs = target - now;
  const absDiff = Math.abs(diffMs);
  const seconds = Math.floor(absDiff / 1_000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const isFuture = diffMs > 0;

  if (days > 0) {
    return isFuture ? `in ${days}d` : `${days}d ago`;
  }
  if (hours > 0) {
    return isFuture ? `in ${hours}h` : `${hours}h ago`;
  }
  if (minutes > 0) {
    return isFuture ? `in ${minutes}m` : `${minutes}m ago`;
  }
  return isFuture ? "in a moment" : "just now";
}

/**
 * Absolute date: "06 Apr 2026"
 *
 * Returns "—" for missing or invalid date strings.
 */
export function formatAbsolute(date: string): string {
  if (!date) return "\u2014";
  const d = toDate(date);
  if (!isValidDate(d)) return "\u2014";
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Absolute date + time: "06 Apr 2026, 14:30"
 *
 * Returns "—" for missing or invalid date strings.
 */
export function formatDateTime(date: string): string {
  if (!date) return "\u2014";
  const d = toDate(date);
  if (!isValidDate(d)) return "\u2014";
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Whether the given date is strictly in the past.
 *
 * Returns false for missing or invalid date strings.
 */
export function isOverdue(date: string): boolean {
  if (!date) return false;
  const d = toDate(date);
  if (!isValidDate(d)) return false;
  return d.getTime() < Date.now();
}

/**
 * Whole days until the given date. Negative when the date is in the past.
 *
 * Returns 0 for missing or invalid date strings.
 */
export function daysUntil(date: string): number {
  if (!date) return 0;
  const d = toDate(date);
  if (!isValidDate(d)) return 0;
  const diffMs = d.getTime() - Date.now();
  return Math.ceil(diffMs / (1_000 * 60 * 60 * 24));
}
