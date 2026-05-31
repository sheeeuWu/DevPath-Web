/**
 * rateLimiter.ts
 *
 * Zero-dependency, in-memory sliding-window rate limiter for Next.js Route Handlers.
 * Keyed by IP address. Safe for use in serverless/edge-adjacent environments — each
 * warm instance maintains its own store, which is the correct behaviour for Next.js
 * server-side route handlers.
 *
 * Usage:
 *   const result = rateLimit(request, { limit: 10, windowMs: 60_000 });
 *   if (!result.success) return result.response;
 */

interface RateLimitEntry {
  /** Timestamps of requests within the current window (ms). */
  timestamps: number[];
}

/** Module-level store — persists across requests within the same server instance. */
const store = new Map<string, RateLimitEntry>();

/** Purge entries that have no timestamps left to keep memory bounded. */
function prune() {
  for (const [key, entry] of store.entries()) {
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. Default: 10 */
  limit?: number;
  /** Window duration in milliseconds. Default: 60_000 (1 minute) */
  windowMs?: number;
  /** Human-readable message included in the 429 response body. */
  message?: string;
}

export interface RateLimitResult {
  /** True when the request is within the allowed limit. */
  success: true;
  /** Remaining requests allowed in the current window. */
  remaining: number;
}

export interface RateLimitBlocked {
  success: false;
  /** Ready-to-return NextResponse with status 429. */
  response: Response;
}

/**
 * Extracts the real client IP from a Next.js Request, respecting common
 * reverse-proxy headers (Vercel, Cloudflare, standard X-Forwarded-For).
 */
function getIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-real-ip') ??
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/**
 * Sliding-window rate limiter. Call at the top of any Route Handler POST function.
 *
 * @returns `{ success: true, remaining }` if allowed, or
 *          `{ success: false, response }` with a 429 response to return immediately.
 */
export function rateLimit(
  request: Request,
  options: RateLimitOptions = {}
): RateLimitResult | RateLimitBlocked {
  const { limit = 10, windowMs = 60_000, message = 'Too many requests. Please try again later.' } = options;

  const ip = getIp(request);
  const now = Date.now();
  const windowStart = now - windowMs;

  // Retrieve or initialise the entry for this IP
  if (!store.has(ip)) {
    store.set(ip, { timestamps: [] });
  }

  const entry = store.get(ip)!;

  // Slide the window — discard timestamps older than windowStart
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= limit) {
    // Compute retry-after in seconds (time until oldest timestamp leaves the window)
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    return {
      success: false,
      response: new Response(
        JSON.stringify({ success: false, message }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil((oldestInWindow + windowMs) / 1000)),
          },
        }
      ),
    };
  }

  // Record this request
  entry.timestamps.push(now);

  // Occasionally prune the store to prevent unbounded memory growth
  if (Math.random() < 0.01) prune();

  return {
    success: true,
    remaining: limit - entry.timestamps.length,
  };
}
