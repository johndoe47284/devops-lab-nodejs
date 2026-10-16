/**
 * Maps uptime (seconds) to a human-readable label.
 * DEVOPS-4 (Student D)
 *   < 60 s    → 'warming-up'
 *   < 3600 s  → 'healthy'
 *   ≥ 3600 s  → 'steady'
 * Throws 'invalid uptime' for negative values, NaN or non-numbers.
 */
export const WARMUP_SECONDS = 60
export const STEADY_SECONDS = 3600

export function formatStatus (uptimeSec) {
  if (typeof uptimeSec !== 'number' || Number.isNaN(uptimeSec) || uptimeSec < 0) {
    throw new Error('invalid uptime')
  }
  if (uptimeSec < WARMUP_SECONDS) return 'warming-up'
  if (uptimeSec < STEADY_SECONDS) return 'healthy'
  return 'steady'
}
