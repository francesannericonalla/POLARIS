/**
 * Returns a human-readable relative time string, e.g. "Today", "Yesterday", "3 days ago".
 * Capitalised for use as standalone labels.
 */
export function daysSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
}

/**
 * Formats a date as "Sep 12, 2026" using the Philippine locale.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
