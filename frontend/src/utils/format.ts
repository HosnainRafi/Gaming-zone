/** Format milliseconds → MM:SS or HH:MM:SS */
export function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function remainingMsFromEndTime(
  endTime: string,
  nowMs = Date.now(),
): number {
  const endMs = new Date(endTime).getTime();
  if (Number.isNaN(endMs)) return 0;
  return Math.max(0, endMs - nowMs);
}

/** Format a BDT amount, e.g. ৳120.00 */
export function formatBDT(amount: number): string {
  return `৳${amount.toFixed(2)}`;
}

/** Calculate price: (hourlyRate / 60) × minutes */
export function calcPrice(hourlyRate: number, minutes: number): number {
  return (hourlyRate / 60) * minutes;
}
