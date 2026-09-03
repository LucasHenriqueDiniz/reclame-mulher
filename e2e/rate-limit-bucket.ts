/**
 * `/api/auth/login` and `/api/auth/change-password` rate-limit by client IP and
 * keep the counter in memory: five requests per bucket per fifteen minutes
 * (`src/lib/rate-limit.ts`). `getClientIp` reads `x-forwarded-for` first and
 * falls back to the string "unknown", so without a header every request this
 * machine makes — across every spec and every run — shares one bucket. A dev
 * server reused between runs then 429s the suite for reasons that have nothing
 * to do with the code under test.
 *
 * So each context that touches a rate-limited route declares an address of its
 * own, drawn fresh per process. 198.18.0.0/15 is the reserved benchmarking
 * range: never a real client, and wide enough that two runs picking the same
 * bucket is not worth thinking about.
 *
 * The limiter itself is left exactly as it is. A test that needed the limiter
 * disabled would be testing a different application.
 */
const RUN_PREFIX = `198.18.${Math.floor(Math.random() * 256)}`;

/** Distinct labels get distinct buckets; the same label reuses one. */
export function runClientIp(label: string): string {
  let hash = 7;
  for (const char of label) {
    hash = (hash * 31 + char.charCodeAt(0)) % 256;
  }
  return `${RUN_PREFIX}.${hash}`;
}
