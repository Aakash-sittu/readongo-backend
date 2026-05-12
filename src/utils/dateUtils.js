/**
 * Checks if a date string is within the last 24 hours.
 * @param {string} dateStr - The date string to check.
 * @returns {boolean} - True if within 24 hours, false otherwise.
 */
export function isWithin24h(dateStr) {
  const then = new Date(dateStr).getTime();
  return !isNaN(then) && (Date.now() - then) < 86400_000;
}
